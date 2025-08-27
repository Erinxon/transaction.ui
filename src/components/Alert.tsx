import React, { type JSX, type ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type?: AlertType;
    message: string;
    templateMessage?: ReactNode;
    className?: string;
    onClose?: () => void;
}

const ICONS: Record<AlertType, JSX.Element> = {
    success: (
        <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
    ),
};

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, templateMessage, className, onClose }) => {
    const baseColors = {
        success: 'bg-green-100 border-green-400 text-green-700',
        error: 'bg-red-100 border-red-400 text-red-700',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700',
    };

    return (
        <div
            role="alert"
            className={`flex items-center px-4 py-3 border rounded-md ${baseColors[type]} space-x-2 ${className}`}
        >
            {ICONS[type]}
            <div className="flex-1">
                <p className="text-sm">{message}</p>
                {templateMessage && templateMessage}
            </div>

            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className={`text-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-600 hover:text-opacity-80 focus:outline-none cursor-pointer`}
                    aria-label="Close alert"
                >
                    ✕
                </button>
            )}
        </div>
    );
};
