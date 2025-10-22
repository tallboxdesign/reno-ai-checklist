import React, { useState, useRef, useCallback, useEffect } from 'react';
// FIX: Removed `LiveSession` from import as it is not an exported member of the module.
import { GoogleGenAI, Modality } from '@google/genai';
import { generateChecklist, generateTitleFromNotes } from '../services/geminiService';
import type { Project, ChecklistItem } from '../types';
import { MicIcon, StopIcon, CameraIcon, LinkIcon, CalendarIcon } from './icons';

interface NewProjectFormProps {
  onAddProject: (project: Project) => void;
}

// FIX: Inferred `LiveSession` type from the `ai.live.connect` method's return type for type safety.
type LiveSession = Awaited<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>>;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// FIX: Added encode function for robust base64 encoding of audio data, as recommended by guidelines.
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onAddProject }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspirationLink, setInspirationLink] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
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

  const startRecording = async () => {
    setError(null);
    setIsRecording(true);
    setNotes('');
    transcriptionRef.current = ''; // Reset accumulator

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                systemInstruction: 'You are a voice transcription service. Your only task is to transcribe the user\'s audio input accurately. Do not generate any spoken response or have a conversation.',
            },
            callbacks: {
                onopen: () => { console.log('Live session opened.'); },
                onmessage: (message) => {
                    if (message.serverContent?.inputTranscription) {
                        // Accumulate transcription in the background
                        transcriptionRef.current += message.serverContent.inputTranscription.text;
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

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    
    liveSessionRef.current?.close();
    liveSessionRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

    audioStreamRef.current?.getTracks().forEach(track => track.stop());
    audioStreamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setPhoto(base64);
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
      const checklistItems = await generateChecklist(title, notes, photo);
      const newProject: Project = {
        id: Date.now().toString(),
        title,
        date,
        inspirationLink,
        photo,
        notes,
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
    } catch (err: any) {
      setError(err.message || 'Failed to generate checklist.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mb-8 max-w-2xl mx-auto border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Create New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Project Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
            placeholder={isGeneratingTitle ? "Generating title from notes..." : "e.g., Kitchen Renovation"}
            required
            disabled={isGeneratingTitle}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Target Date</label>
            <div className="relative mt-1">
                <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-slate-800 dark:text-slate-100"
                required
                />
            </div>
           </div>
           <div>
            <label htmlFor="inspirationLink" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Inspiration Link</label>
            <div className="relative mt-1">
                <LinkIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                type="url"
                id="inspirationLink"
                value={inspirationLink}
                onChange={(e) => setInspirationLink(e.target.value)}
                className="pl-10 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-slate-800 dark:text-slate-100"
                placeholder="https://example.com"
                />
            </div>
           </div>
        </div>

        <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Voice Notes</label>
            <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-slate-800 dark:text-slate-100"
                placeholder="Record your thoughts or type them here..."
            />
        </div>
        
        <div className="flex items-center space-x-4">
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
                {isRecording ? <StopIcon className="w-5 h-5 mr-2"/> : <MicIcon className="w-5 h-5 mr-2" />}
                {isRecording ? 'Stop Recording' : 'Record Notes'}
            </button>

            <label htmlFor="photo-upload" className="cursor-pointer flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                <CameraIcon className="w-5 h-5 mr-2" />
                <span>{photo ? 'Change Photo' : 'Add Photo'}</span>
                <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
            </label>
        </div>

        {photo && (
          <div className="mt-4">
            <img src={photo} alt="Renovation preview" className="max-h-48 rounded-lg shadow-md mx-auto" />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isProcessing || isRecording || isGeneratingTitle}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Generating...' : '✨ Generate AI Checklist'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectForm;