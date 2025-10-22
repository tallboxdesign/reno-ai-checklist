import { GoogleGenAI, Type } from "@google/genai";
import type { ChecklistItem } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const checklistSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      task: {
        type: Type.STRING,
        description: 'A concise description of the renovation task.',
      },
      details: {
        type: Type.STRING,
        description: 'Optional further details about the task.',
      },
    },
    required: ['task'],
  },
};

export const generateChecklist = async (title: string, notes: string, imageBase64?: string): Promise<Omit<ChecklistItem, 'id' | 'completed'>[]> => {
  try {
    const currentDate = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    const promptParts: (string | { inlineData: { mimeType: string; data: string } })[] = [
        `You are a helpful renovation planning assistant. The current date is ${currentDate}. Use this information to resolve any relative date references (e.g., 'tomorrow', 'next week') in the user's notes.
        Based on the project title, notes, and the provided image, generate a detailed checklist of tasks.
        First, perform Optical Character Recognition (OCR) on the image to extract any text from documents, labels, or notes. 
        Then, analyze the visual content of the image (e.g., room layout, existing fixtures, condition of surfaces).
        Combine the project title, your notes, the extracted text from the image, and the visual analysis to create a comprehensive checklist.

        Project Title: "${title}"
        Notes: "${notes}"
        
        Generate a JSON array of objects, where each object represents a checklist item with "task" and optional "details" fields.`,
    ];

    if (imageBase64) {
      const mimeType = imageBase64.split(';')[0].split(':')[1];
      const data = imageBase64.split(',')[1];
      promptParts.push({
        inlineData: {
          mimeType,
          data,
        },
      });
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: promptParts.map(part => typeof part === 'string' ? { text: part } : part) },
      config: {
        responseMimeType: "application/json",
        responseSchema: checklistSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];

  } catch (error) {
    console.error("Error generating checklist:", error);
    throw new Error("Failed to generate checklist. Please try again.");
  }
};

export const generateTitleFromNotes = async (notes: string): Promise<string> => {
  if (!notes.trim()) {
    return '';
  }
  try {
    const prompt = `Based on the following project notes, generate a concise and descriptive project title. The title should be no more than 5-7 words. Respond with only the title text and nothing else.
    
    Notes: "${notes}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Trim and remove quotes if the AI includes them
    return response.text.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Error generating title:", error);
    // Return a generic title or empty string on failure to not block the user.
    return "New Project from Notes";
  }
};