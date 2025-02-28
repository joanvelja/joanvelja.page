'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { SidenotesContext } from './Sidenotes';

export function FloatingNote({ children, type = 'popup' }) {
    const [isHovered, setIsHovered] = useState(false);
    const [noteNumber, setNoteNumber] = useState(null);
    const { addNote } = useContext(SidenotesContext);
    const contentRef = useRef(children);

    useEffect(() => {
        if (contentRef.current && !noteNumber) {
            const number = addNote(contentRef.current);
            setNoteNumber(number);
        }
    }, [addNote, noteNumber]);

    if (!noteNumber) return null;

    return (
        <span
            className="relative inline group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <a 
                href={`#note-${noteNumber}`}
                id={`ref-${noteNumber}`}
                className="cursor-help text-white-300 underline hover:underline"
            >
                <sup className="text-white-300 font-sans font-semibold">{noteNumber}</sup>
            </a>
            
            <span
                className={`
                    absolute z-50 p-4 rounded-lg bg-white dark:bg-neutral-800 
                    shadow-lg border border-neutral-200 dark:border-neutral-700
                    text-sm text-neutral-700 dark:text-neutral-300 font-serif
                    transition-all duration-200 pointer-events-none
                    ${type === 'popup' ? 'w-64 -translate-x-1/2 left-1/2 bottom-full mb-2' : 'w-48 -right-52 top-0'}
                    ${isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}
                `}
            >
                {children}
            </span>
        </span>
    );
} 