'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { MarginNotesContext } from './MarginNotes';

export function MarginNote({ children, label }) {
    const { registerNote } = useContext(MarginNotesContext);
    const [id, setId] = useState(null);
    // Use refs to keep registerNote dependency stable if children/label change (though they shouldn't usually)
    const contentRef = useRef(children);
    const labelRef = useRef(label);

    useEffect(() => {
        contentRef.current = children;
        labelRef.current = label;
    }, [children, label]);
    
    useEffect(() => {
        // Generate a unique ID for this note
        const noteId = `margin-note-${Math.random().toString(36).substring(2, 10)}`;
        setId(noteId);
        
        // Register this note with the context
        registerNote({
            id: noteId,
            content: contentRef.current,
            label: labelRef.current || 'Note'
        });
    }, [registerNote]);

    if (!id) return null;

    return (
        <span 
            id={id} 
            className="relative inline-block" 
            data-margin-note-id={id}
        >
            <span className="sr-only">{children}</span>
        </span>
    );
} 