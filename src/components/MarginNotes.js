'use client';

import { createContext, useState, useEffect, useRef } from 'react';

export const MarginNotesContext = createContext();

export function MarginNotesProvider({ children }) {
    const [notes, setNotes] = useState([]);
    const [visibleNotes, setVisibleNotes] = useState([]);
    const notePositions = useRef(new Map());
    const observerRef = useRef(null);
    const contentRef = useRef(null);

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

        // Add hover effects for margin notes
        const addHoverEffects = () => {
            const noteElements = document.querySelectorAll('[data-margin-note-id]');
            noteElements.forEach(element => {
                // Add hover class to make notes subtly detectable
                element.classList.add('hover:bg-blue-50', 'dark:hover:bg-blue-900/10', 'transition-colors', 'cursor-help');
            });
        };

        // Start observing any existing notes
        const updateObservedElements = () => {
            const noteElements = document.querySelectorAll('[data-margin-note-id]');
            noteElements.forEach(element => {
                observerRef.current.observe(element);
            });
            addHoverEffects();
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
            observerRef.current?.disconnect();
            mutationObserver?.disconnect();
        };
    }, []);

    return (
        <MarginNotesContext.Provider value={{ notes, registerNote }}>
            <div ref={contentRef} className="relative max-w-full">
                {children}
            
                {/* Margin notes container - positioned outside the content container */}
                {notes.length > 0 && (
                    <div className="absolute top-0 right-0 w-64 h-full hidden xl:block" 
                         style={{ left: 'calc(50% + 400px)', marginLeft: '2rem' }}>
                        <div className="relative w-full h-full">
                            {notes.filter(note => visibleNotes.includes(note.id)).map(note => {
                                // Calculate position based on the original element's position
                                const position = notePositions.current.get(note.id) || 0;
                                const contentTop = contentRef.current?.getBoundingClientRect().top || 0;
                                const adjustedPosition = position - window.scrollY - contentTop;
                                
                                return (
                                    <div
                                        key={note.id}
                                        className="absolute left-0 w-64 text-sm
                                                border-l-2 border-neutral-200 dark:border-neutral-700 pl-4
                                                text-neutral-600 dark:text-neutral-400 font-serif opacity-80 hover:opacity-100 transition-opacity"
                                        style={{
                                            top: `${adjustedPosition}px`,
                                            maxWidth: '16rem'
                                        }}
                                    >
                                        {note.label && note.label !== 'Note' && (
                                            <div className="font-medium text-xs mb-1 text-neutral-500 dark:text-neutral-500">
                                                {note.label}
                                            </div>
                                        )}
                                        <div className="prose prose-sm prose-neutral dark:prose-invert">
                                            {note.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </MarginNotesContext.Provider>
    );
} 