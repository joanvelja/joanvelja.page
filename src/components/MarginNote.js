'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { MarginNotesContext } from './MarginNotes';

export function MarginNote({ children, label }) {
    const { registerNote } = useContext(MarginNotesContext);
    const [id, setId] = useState(null);
    const contentRef = useRef(children);
    const labelRef = useRef(label);
    
    useEffect(() => {
        // Generate a unique ID for this note if not already set
        if (!id) {
            const noteId = `margin-note-${Math.random().toString(36).substring(2, 10)}`;
            setId(noteId);
            
            // Register this note with the context
            registerNote({
                id: noteId,
                content: contentRef.current,
                label: labelRef.current || 'Note'
            });
            
            // Add a small delay to ensure the element is in the DOM
            setTimeout(() => {
                // Get the reference element position
                const refElement = document.getElementById(noteId);
                if (refElement) {
                    // The registration will be handled by the intersection observer in MarginNotes
                    refElement.dataset.marginNoteId = noteId;
                }
            }, 0);
        }
    }, [id, registerNote]);

    if (!id) return null;

    return (
        <span id={id} className="relative inline-block">
            <mark className="bg-yellow-100 dark:bg-yellow-900/30 px-0.5 cursor-help">
                {children}
            </mark>
        </span>
    );
} 