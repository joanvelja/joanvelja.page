'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

export const SidenotesContext = createContext();

export function SidenotesProvider({ children }) {
    const [notes, setNotes] = useState([]);
    const notesMap = useRef(new Map());
    
    const addNote = (content) => {
        // Create a content hash to identify unique notes
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        
        // If we've seen this note before, return its number
        if (notesMap.current.has(contentStr)) {
            return notesMap.current.get(contentStr);
        }

        // Otherwise, create a new note
        const number = notesMap.current.size + 1;
        notesMap.current.set(contentStr, number);
        
        // Only add to notes array if it's new
        setNotes(prev => {
            if (prev.some(note => note.number === number)) {
                return prev;
            }
            return [...prev, { number, content }];
        });

        return number;
    };

    return (
        <SidenotesContext.Provider value={{ notes, addNote }}>
            {children}
            {notes.length > 0 && (
                <div className="mt-16 pt-8 pb-8 mb-8 border-t border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white font-serif">Notes</h2>
                    <div className="space-y-4">
                        {notes.map(({ number, content }) => (
                            <div key={number} id={`note-${number}`} className="flex gap-2 text-sm text-neutral-700 dark:text-neutral-300 font-serif">
                                <a href={`#ref-${number}`} className="text-white-500 hover:underline font-sans">
                                    {number}
                                </a>
                                <div>{content}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </SidenotesContext.Provider>
    );
} 