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
        <path fillRule="evenodd" d="M16.5 6a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0 0 1h8a.5.5 0 0 0 .5-.5zM8 9a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1zm8 12.5a.5.5 0 0 0 .5-.5V9h-1v12a.5.5 0 0 1-.5-.5h-7a.5.5 0 0 1-.5-.5V9h-1v12a1.5 1.5 0 0 0 1.5 1.5h7zM6 9h12V7H6v2z" clipRule="evenodd" />
    </svg>
);

export const CurrencyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.59 3.48 3.58 3.96 2.04.48 3 .88 3 2.12 0 1.03-.9 1.77-2.7 1.77-2.07 0-2.65-.91-2.65-2.1h-2.2c.08 2.02 1.38 3.33 3.55 3.83V21h3v-2.15c2.17-.48 3.5-1.65 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
    </svg>
);

export const ShareIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
);

export const BellIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 18.5a4 4 0 0 1-4-4H8a6 6 0 0 0 6 6v2.5a.5.5 0 0 0 1 0V20a6 6 0 0 0 6-6h-2a4 4 0 0 1-4 4z"/>
        <path fillRule="evenodd" d="M12 2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 12 2zM3 10a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm17 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zM6 15a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm11.5-.5a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1zM12 4a8 8 0 0 0-8 8v2c0 .24.03.47.09.7L4 18h16l-.09-3.3a8.003 8.003 0 0 0 .09-.7v-2a8 8 0 0 0-8-8zm-6 8v2c0 .09.01.18.03.27L6 16h12l.03-1.73a6.002 6.002 0 0 1 .03-.27v-2a6 6 0 0 0-12 0z" clipRule="evenodd"/>
    </svg>
);