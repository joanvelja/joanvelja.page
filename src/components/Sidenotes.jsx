'use client';

import { createContext, useState, useRef } from 'react';

export const SidenotesContext = createContext();

export function SidenotesProvider({ children }) {
    const [notes, setNotes] = useState([]);
    const notesMap = useRef(new Map());

    const addNote = (content) => {
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

        if (notesMap.current.has(contentStr)) {
            return notesMap.current.get(contentStr);
        }

        const number = notesMap.current.size + 1;
        notesMap.current.set(contentStr, number);

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
                <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white font-serif tracking-tight">
                        Notes
                    </h2>
                    <ol className="space-y-3 list-none p-0 m-0">
                        {notes.map(({ number, content }) => (
                            <li
                                key={number}
                                id={`sidenote-${number}`}
                                className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed scroll-mt-24"
                            >
                                <span className="flex-shrink-0 font-sans text-xs font-medium w-6 text-right citation-marker">
                                    {number}
                                </span>
                                <div className="flex-1">
                                    {content}
                                    <a
                                        href={`#sidenote-ref-${number}`}
                                        className="ml-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs"
                                        title="Back to text"
                                    >
                                        ↩
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </SidenotesContext.Provider>
    );
}
