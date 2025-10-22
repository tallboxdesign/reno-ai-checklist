import React, { useState, useEffect } from 'react';
import type { Project, ChecklistItem } from '../types';
import { getAISuggestions } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface SuggestionsModalProps {
  project: Project;
  item: ChecklistItem;
  onClose: () => void;
}

type SuggestionType = 'variations' | 'materials';

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ project, item, onClose }) => {
  const [suggestionType, setSuggestionType] = useState<SuggestionType>('variations');
  const [suggestions, setSuggestions] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions('');
    try {
      const result = await getAISuggestions(project, item, suggestionType);
      setSuggestions(result);
    } catch (err: any) {
      setError(err.message || 'Failed to get suggestions.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const RadioButton = ({ value, label }: { value: SuggestionType; label: string }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        name="suggestionType"
        value={value}
        checked={suggestionType === value}
        onChange={() => setSuggestionType(value)}
        className="form-radio h-4 w-4 text-indigo-600 border-zinc-300 dark:border-zinc-600 focus:ring-indigo-500 bg-zinc-100 dark:bg-zinc-800"
      />
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</span>
    </label>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 m-4 max-w-2xl w-full flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2 text-indigo-500"/>
            AI Suggestions
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 p-1 rounded-full"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-y border-zinc-200 dark:border-zinc-700 py-4 mb-4">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">For task:</p>
            <p className="font-semibold text-zinc-700 dark:text-zinc-200">{item.task}</p>
        </div>
        
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Suggest:</span>
              <RadioButton value="variations" label="Alternative Variations" />
              <RadioButton value="materials" label="Different Materials" />
            </div>
            <button
                onClick={handleGenerateSuggestions}
                disabled={isLoading}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-zinc-400"
            >
                {isLoading ? 'Generating...' : '✨ Generate'}
            </button>
        </div>

        <div className="flex-grow w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm overflow-y-auto">
          {isLoading && <p className="text-center text-zinc-500">The AI is thinking...</p>}
          {error && <p className="text-rose-500">{error}</p>}
          {suggestions ? (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br />') }}></div>
          ) : (
            !isLoading && <p className="text-center text-zinc-500">Suggestions will appear here.</p>
          )}
        </div>
        
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SuggestionsModal;
