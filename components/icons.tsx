
import React from 'react';

export const MicIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 11a1 1 0 0 1-2 0 5 5 0 0 0-10 0 1 1 0 0 1-2 0 7 7 0 0 1 14 0zM5 20v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zM17 20v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zM9 20v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zM13 20v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zM21 11h-2a7 7 0 0 0-7-7V2a9 9 0 0 1 9 9zM5 11H3a9 9 0 0 1 9-9v2a7 7 0 0 0-7 7z" />
  </svg>
);

export const StopIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6z"/>
    </svg>
);

export const CameraIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path fillRule="evenodd" d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6zm3-1a1 1 0 0 0-1 1v1h16V6a1 1 0 0 0-1-1H5zm15 3H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9z" clipRule="evenodd" />
  </svg>
);

export const LinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.586 13.414a2 2 0 1 1 2.828 2.828l-4 4a2 2 0 0 1-2.828-2.828l1.172-1.172a1 1 0 1 1 1.414 1.414l-1.172 1.172a.001.001 0 0 0 0 0 .002.002 0 0 0-.001.003L8 19.999a.001.001 0 0 0 .001.001l.002.002a.001.001 0 0 0 .001 0z" /><path d="M13.414 10.586a2 2 0 1 1-2.828-2.828l4-4a2 2 0 0 1 2.828 2.828l-1.172 1.172a1 1 0 1 1-1.414-1.414l1.172-1.172a.001.001 0 0 0 0 0 .002.002 0 0 0 .001-.003L16 4.001a.001.001 0 0 0-.001-.001l-.002-.002a.001.001 0 0 0-.001 0z" /><path fillRule="evenodd" d="M12 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm-6-2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm10 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zM6 9a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1zm12 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1z" clipRule="evenodd" />
  </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M6 5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v1h-1V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1H6V5zm12 3H6v11a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8zM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm4-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
    </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M16.5 6a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0 0 1h8a.5.5 0 0 0 .5-.5zM8 9a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1zm8 12.5a.5.5 0 0 0 .5-.5V9h-1v12a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5V9h-1v12a1.5 1.5 0 0 0 1.5 1.5h7zM6 9h12V7H6v2z" clipRule="evenodd" />
    </svg>
);
