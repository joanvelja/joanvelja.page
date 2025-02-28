'use client';

import { createContext, useState, useEffect, useRef } from 'react';

export const MarginNotesContext = createContext();

export function MarginNotesProvider({ children }) {
    const [notes, setNotes] = useState([]);
    const [visibleNotes, setVisibleNotes] = useState([]);
    const notePositions = useRef(new Map());
    const observerRef = useRef(null);

    // Register a new note
    const registerNote = (note) => {
        setNotes(prev => {
            // Check if the note already exists
            if (prev.some(n => n.id === note.id)) {
                return prev;
            }
            return [...prev, note];
        });
    };

    useEffect(() => {
        // Create an intersection observer to track which notes are visible
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const id = entry.target.dataset.marginNoteId;
                    if (!id) return;

                    if (entry.isIntersecting) {
                        // Add note to visible notes
                        setVisibleNotes(prev => {
                            if (prev.includes(id)) return prev;
                            return [...prev, id];
                        });

                        // Calculate and store the note's position
                        const rect = entry.target.getBoundingClientRect();
                        const position = rect.top + window.scrollY;
                        notePositions.current.set(id, position);
                    } else {
                        // Remove note from visible notes
                        setVisibleNotes(prev => prev.filter(noteId => noteId !== id));
                    }
                });
            },
            { threshold: 0.1 }
        );

        // Start observing any existing notes
        const updateObservedElements = () => {
            const noteElements = document.querySelectorAll('[data-margin-note-id]');
            noteElements.forEach(element => {
                observerRef.current.observe(element);
            });
        };

        // Initial observation
        updateObservedElements();

        // Set up a mutation observer to catch dynamically added notes
        const mutationObserver = new MutationObserver(mutations => {
            let shouldUpdate = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                updateObservedElements();
            }
        });
        
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            observerRef.current.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    return (
        <MarginNotesContext.Provider value={{ notes, registerNote }}>
            {children}
            
            {/* Margin notes container */}
            {notes.length > 0 && (
                <div className="fixed right-4 top-0 w-64 h-full pointer-events-none">
                    <div className="relative w-full h-full">
                        {notes.filter(note => visibleNotes.includes(note.id)).map(note => {
                            // Calculate position based on the original element's position
                            const position = notePositions.current.get(note.id) || 0;
                            
                            return (
                                <div
                                    key={note.id}
                                    className="absolute right-0 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 
                                               dark:border-neutral-700 rounded-md p-3 shadow-md text-sm pointer-events-auto
                                               text-neutral-700 dark:text-neutral-300 font-serif"
                                    style={{
                                        transform: `translateY(${position}px)`,
                                        maxWidth: '16rem',
                                        transition: 'transform 0.3s ease'
                                    }}
                                >
                                    <div className="font-bold text-xs mb-1 text-neutral-500 dark:text-neutral-400">
                                        {note.label}
                                    </div>
                                    <div>
                                        {note.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </MarginNotesContext.Provider>
    );
} 