import React, { useState, useMemo, useEffect } from 'react';
import type { Project } from '../types';

interface ShareModalProps {
  project: Project;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ project, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  const formattedProjectText = useMemo(() => {
    const formatCurrency = (amount?: number): string => {
      if (amount === undefined || amount === null) return 'Not set';
      return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const checklistItems = project.checklist
      .map(item => {
        const prefix = item.completed ? '[x]' : '[ ]';
        let itemText = `${prefix} ${item.task}`;
        if (item.details) {
          itemText += `\n    - ${item.details}`;
        }
        return itemText;
      })
      .join('\n');

    let output = `========================================\n`;
    output += `PROJECT: ${project.title}\n`;
    output += `========================================\n\n`;
    output += `Status: ${project.status}\n`;
    output += `Target Date: ${new Date(project.date).toLocaleDateString()}\n\n`;

    if (project.estimatedCost !== undefined || project.actualCost !== undefined) {
      output += `--- BUDGET ---\n`;
      output += `Estimated: ${formatCurrency(project.estimatedCost)}\n`;
      output += `Actual:    ${formatCurrency(project.actualCost)}\n\n`;
    }

    if (project.notes) {
      output += `--- NOTES ---\n${project.notes}\n\n`;
    }
    
    output += `--- CHECKLIST ---\n`;
    output += project.checklist.length > 0 ? `${checklistItems}\n\n` : `No items in checklist.\n\n`;
    
    if (project.inspirationLink) {
        output += `--- INSPIRATION ---\nLink: ${project.inspirationLink}\n`;
    }

    return output;
  }, [project]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(formattedProjectText).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Failed to copy');
    });
  };

  const handleDownload = () => {
    const blob = new Blob([formattedProjectText], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `${project.title.replace(/[\s/\\?%*:|"<>]/g, '_').toLowerCase()}_export.txt`;
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  
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
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Export Project Details</h2>
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
        <textarea
          readOnly
          className="flex-grow w-full p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg border border-zinc-300 dark:border-zinc-700 font-mono text-sm resize-none"
          value={formattedProjectText}
        />
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all"
          >
            {copyButtonText}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-md shadow-sm text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
          >
            Download as .txt
          </button>
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

export default ShareModal;