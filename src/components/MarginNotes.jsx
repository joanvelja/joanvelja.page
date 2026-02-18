'use client';

import { createContext, useEffect, useRef, useCallback, useReducer } from 'react';

export const MarginNotesContext = createContext();

const initialState = { notes: [], visibleNotes: [] };

function reducer(state, action) {
    switch (action.type) {
        case 'REGISTER_NOTE': {
            if (state.notes.some(note => note.id === action.note.id)) return state;
            return { ...state, notes: [...state.notes, action.note] };
        }
        case 'SET_VISIBLE_NOTES': {
            return { ...state, visibleNotes: action.visibleNotes };
        }
        default:
            return state;
    }
}

export function MarginNotesProvider({ children }) {
    const [{ notes, visibleNotes }, dispatch] = useReducer(reducer, initialState);
    const notePositions = useRef(new Map());
    const visibleNotesRef = useRef(new Set());
    const observerRef = useRef(null);
    const contentRef = useRef(null);
    const updateTimeout = useRef(null);

    const registerNote = useCallback((note) => {
        dispatch({ type: 'REGISTER_NOTE', note });
    }, []);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                let changed = false;
                const nextVisible = visibleNotesRef.current;

                entries.forEach(entry => {
                    const id = entry.target.dataset.marginNoteId;
                    if (!id) return;

                    if (entry.isIntersecting) {
                        if (!nextVisible.has(id)) {
                            nextVisible.add(id);
                            changed = true;
                        }

                        const position = entry.boundingClientRect.top + window.scrollY;
                        notePositions.current.set(id, position);
                    } else {
                        if (nextVisible.delete(id)) {
                            changed = true;
                        }
                    }
                });

                if (changed) {
                    dispatch({ type: 'SET_VISIBLE_NOTES', visibleNotes: Array.from(nextVisible) });
                }
            },
            { threshold: 0.1 }
        );

        const addHoverEffects = () => {
            const noteElements = document.querySelectorAll('[data-margin-note-id]');
            noteElements.forEach(element => {
                element.classList.add('hover:bg-blue-50', 'dark:hover:bg-blue-900/10', 'transition-colors', 'cursor-help');
            });
        };

        const updateObservedElements = () => {
            const noteElements = document.querySelectorAll('[data-margin-note-id]');
            noteElements.forEach(element => {
                observerRef.current.observe(element);
            });
            addHoverEffects();
        };

        updateObservedElements();

        const mutationObserver = new MutationObserver(mutations => {
            let shouldUpdate = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });

            if (shouldUpdate) {
                clearTimeout(updateTimeout.current);
                updateTimeout.current = setTimeout(updateObservedElements, 50);
            }
        });

        if (contentRef.current) {
            mutationObserver.observe(contentRef.current, { childList: true, subtree: true });
        }

        return () => {
            observerRef.current?.disconnect();
            mutationObserver?.disconnect();
            clearTimeout(updateTimeout.current);
            visibleNotesRef.current.clear();
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
