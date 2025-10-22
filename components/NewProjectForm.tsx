import React, { useState, useRef, useCallback, useEffect } from 'react';
// FIX: Removed `LiveSession` from import as it is not an exported member of the module.
import { GoogleGenAI, Modality, FunctionDeclaration, Type } from '@google/genai';
import { generateChecklist, generateTitleFromNotes, estimateProjectCost } from '../services/geminiService';
import { compressImage } from '../services/imageService';
import type { Project } from '../types';
import { MicIcon, StopIcon, CameraIcon, LinkIcon, CalendarIcon, CurrencyIcon } from './icons';

interface NewProjectFormProps {
  onAddProject: (project: Project) => void;
}

// FIX: Inferred `LiveSession` type from the `ai.live.connect` method's return type for type safety.
type LiveSession = Awaited<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>>;

// FIX: Added encode function for robust base64 encoding of audio data, as recommended by guidelines.
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const setTargetDateFunctionDeclaration: FunctionDeclaration = {
  name: 'setTargetDate',
  description: 'Sets the target completion date for the project based on user speech.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description: 'The target date in YYYY-MM-DD format.',
      },
    },
    required: ['date'],
  },
};

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onAddProject }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspirationLink, setInspirationLink] = useState('');
  const [photo, setPhoto] = useState<{ thumbnail: string; full: string } | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [details, setDetails] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isEstimatingCost, setIsEstimatingCost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const liveSessionRef = useRef<LiveSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriptionRef = useRef<string>(''); // To accumulate transcription

  // Use a ref to get the latest title value inside the 'onclose' callback to avoid stale state.
  const titleRef = useRef(title);
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const stopRecording = useCallback(() => {
    // This function can be called by user action or by an error handler.
    // We make it safe to be called multiple times.
    if (!isRecording) return;

    // Immediately update UI to reflect stopping
    setIsRecording(false);
    
    // Stop capturing and sending audio data to the model
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
    }

    // After stopping audio input, wait a moment for any in-flight
    // transcription responses to arrive from the server before closing the connection.
    // This helps prevent truncated transcriptions.
    setTimeout(() => {
        if (liveSessionRef.current) {
            liveSessionRef.current.close();
            liveSessionRef.current = null;
        }
    }, 2000); // 2-second delay for graceful shutdown
  }, [isRecording]);

  const startRecording = async () => {
    setError(null);
    setIsRecording(true);
    setNotes('');
    transcriptionRef.current = ''; // Reset accumulator

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const currentDate = new Date().toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const systemInstruction = `You are an intelligent renovation planning assistant. Your primary task is to accurately transcribe the user's speech.
As you transcribe, identify if the user mentions a target date for their project (e.g., "next Friday", "the end of the month", "August 1st").
If a date is mentioned, you MUST call the 'setTargetDate' function with the resolved date in YYYY-MM-DD format.
Do not generate any spoken response or have a conversation. Only transcribe and call the function when necessary.
Today's date is ${currentDate}.`;

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                tools: [{ functionDeclarations: [setTargetDateFunctionDeclaration] }],
                systemInstruction: systemInstruction,
            },
            callbacks: {
                onopen: () => { console.log('Live session opened.'); },
                onmessage: (message) => {
                    if (message.serverContent?.inputTranscription) {
                        const newText = message.serverContent.inputTranscription.text;
                        // Accumulate full transcription in a ref
                        transcriptionRef.current += newText;
                        // Update UI with live transcription
                        setNotes(prevNotes => prevNotes + newText);
                    }
                    if (message.toolCall) {
                        for (const fc of message.toolCall.functionCalls) {
                            if (fc.name === 'setTargetDate' && fc.args.date) {
                                const newDate = fc.args.date as string;
                                // Simple validation for YYYY-MM-DD format
                                if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                                    setDate(newDate);
                                }
                                // Respond to the model that the function was handled
                                sessionPromise.then(session => {
                                    session.sendToolResponse({
                                        functionResponses: {
                                            id: fc.id,
                                            name: fc.name,
                                            response: { result: "Date has been set." },
                                        }
                                    });
                                });
                            }
                        }
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setError('An error occurred during recording.');
                    stopRecording();
                },
                onclose: async () => { 
                    console.log('Live session closed.');
                    const finalTranscription = transcriptionRef.current;
                    // Ensure the final state is consistent with the full transcription
                    setNotes(finalTranscription);
                    
                    // If title is empty and we have a transcription, generate a title
                    if (!titleRef.current.trim() && finalTranscription.trim()) {
                        setIsGeneratingTitle(true);
                        try {
                            const generatedTitle = await generateTitleFromNotes(finalTranscription);
                            setTitle(generatedTitle);
                        } catch (err) {
                            console.error("Failed to generate title", err);
                        } finally {
                            setIsGeneratingTitle(false);
                        }
                    }
                }
            }
        });

        liveSessionRef.current = await sessionPromise;

        // FIX: Added `(window as any)` to support `webkitAudioContext` for broader browser compatibility without causing TypeScript errors.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = audioContextRef.current.createMediaStreamSource(stream);
        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
            }
            // FIX: Used the robust `encode` function instead of `btoa(String.fromCharCode(...))` to prevent stack overflow on large inputs.
            const base64 = encode(new Uint8Array(int16.buffer));
            // FIX: Used `sessionPromise.then()` to send data, ensuring the active session is used and preventing race conditions, as per guidelines.
            sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' }});
            });
        };

        source.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(audioContextRef.current.destination);

    } catch (err) {
        console.error("Failed to start recording", err);
        setError("Could not access microphone. Please check permissions.");
        setIsRecording(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedPhoto = await compressImage(file);
        setPhoto(compressedPhoto);
      } catch (error) {
        console.error("Failed to compress image:", error);
        setError("There was an error processing the image.");
      }
    }
  };

  const handleEstimateCost = async () => {
    if (!title.trim() || !notes.trim()) {
      setError("Please provide a title and notes before estimating the cost.");
      return;
    }
    setError(null);
    setIsEstimatingCost(true);
    try {
      const cost = await estimateProjectCost(title, notes, details, photo?.full);
      if (cost !== null) {
        setEstimatedCost(cost.toString());
      } else {
        setError("The AI could not provide a cost estimate for this project.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to get cost estimate.");
    } finally {
      setIsEstimatingCost(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !notes.trim()) {
      setError("Project title and notes are required.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const checklistItems = await generateChecklist(title, notes, details, photo?.full);
      const newProject: Project = {
        id: Date.now().toString(),
        title,
        date,
        inspirationLink,
        photo,
        notes,
        status: 'In Progress',
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        actualCost: actualCost ? parseFloat(actualCost) : undefined,
        checklist: checklistItems.map((item, index) => ({
          ...item,
          id: `${Date.now()}-${index}`,
          completed: false,
        })),
      };
      onAddProject(newProject);
      // Reset form
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setInspirationLink('');
      setPhoto(undefined);
      setNotes('');
      setDetails('');
      setEstimatedCost('');
      setActualCost('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate checklist.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg mb-8 max-w-2xl mx-auto border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">Create New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Project Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100 disabled:bg-zinc-200 dark:disabled:bg-zinc-700"
            placeholder={isGeneratingTitle ? "Generating title from notes..." : "e.g., Kitchen Renovation"}
            required
            disabled={isGeneratingTitle}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
            <label htmlFor="date" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Target Date</label>
            <div className="relative mt-1">
                <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 block w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100"
                required
                />
            </div>
           </div>
           <div>
            <label htmlFor="inspirationLink" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Inspiration Link</label>
            <div className="relative mt-1">
                <LinkIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                <input
                type="url"
                id="inspirationLink"
                value={inspirationLink}
                onChange={(e) => setInspirationLink(e.target.value)}
                className="pl-10 block w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100"
                placeholder="https://example.com"
                />
            </div>
           </div>
            <div>
              <label htmlFor="estimatedCost" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Estimated Cost ($)</label>
              <div className="relative mt-1">
                  <CurrencyIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                  <input
                  type="number"
                  id="estimatedCost"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="pl-10 block w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100"
                  placeholder="e.g., 5000"
                  min="0"
                  step="0.01"
                  />
              </div>
            </div>
            <div>
              <label htmlFor="actualCost" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Actual Cost ($)</label>
              <div className="relative mt-1">
                  <CurrencyIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                  <input
                  type="number"
                  id="actualCost"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  className="pl-10 block w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100"
                  placeholder="e.g., 4850.50"
                  min="0"
                  step="0.01"
                  />
              </div>
            </div>
        </div>

        <div>
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Voice Notes</label>
            <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100"
                placeholder="Record your thoughts or type them here..."
            />
        </div>

        <div>
          <label htmlFor="details" className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Additional Details (Optional)</label>
          <textarea
            id="details"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="mt-1 block w-full bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100"
            placeholder="Add any specific measurements, materials, or other details..."
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isRecording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-sky-600 hover:bg-sky-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
            >
                {isRecording ? <StopIcon className="w-5 h-5 mr-2"/> : <MicIcon className="w-5 h-5 mr-2" />}
                {isRecording ? 'Stop Recording' : 'Record Notes'}
            </button>

            <label htmlFor="photo-upload" className="cursor-pointer flex items-center justify-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-md shadow-sm text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                <CameraIcon className="w-5 h-5 mr-2" />
                <span>{photo ? 'Change Photo' : 'Add Photo'}</span>
                <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
            </label>
            <button
              type="button"
              onClick={handleEstimateCost}
              disabled={isEstimatingCost || isRecording}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              {isEstimatingCost ? 'Estimating...' : '🤖 Estimate Cost'}
            </button>
        </div>

        {photo && (
          <div className="mt-4">
            <img src={photo.thumbnail} alt="Renovation preview" className="max-h-48 rounded-lg shadow-md mx-auto" />
          </div>
        )}

        {error && <p className="text-rose-500 text-sm">{error}</p>}
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isProcessing || isRecording || isGeneratingTitle || isEstimatingCost}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Generating...' : '✨ Generate AI Checklist'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectForm;