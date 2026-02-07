'use client';

import React, { useState, useContext, useRef } from 'react';
import { useHoverTooltip } from '@/hooks/useHoverTooltip';

const CitationContext = React.createContext();

export function CitationProvider({ children }) {
    const [citations, setCitations] = useState([]);
    const citationMap = useRef(new Map());

    const addCitation = (citation) => {
        const key = citation.key || `${citation.author}-${citation.year}`;

        if (citationMap.current.has(key)) {
            return citationMap.current.get(key);
        }

        const number = citationMap.current.size + 1;
        citationMap.current.set(key, number);

        setCitations(prev => {
            if (prev.some(cite => cite.number === number)) {
                return prev;
            }
            return [...prev, { number, ...citation }];
        });

        return number;
    };

    return (
        <CitationContext.Provider value={{ citations, addCitation }}>
            {children}
        </CitationContext.Provider>
    );
}

export function Citation({
    author,
    year,
    title,
    url,
    venue,
    key,
}) {
    const { addCitation } = useContext(CitationContext);
    const { show: showTooltip, handlers } = useHoverTooltip();
    const citationRef = useRef(null);

    if (citationRef.current === null) {
        citationRef.current = addCitation({ author, year, title, url, venue, key });
    }
    const citationNumber = citationRef.current;

    return (
        <span
            className="relative inline-block"
            {...handlers}
        >
            <a
                href={`#citation-${citationNumber}`}
                id={`ref-${citationNumber}`}
                className="citation-link citation-marker relative top-[-2px] text-[75%] leading-none no-underline"
            >
                <sup className="font-sans font-medium">[{citationNumber}]</sup>
            </a>

            <span
                className={`
                    absolute z-tooltip w-80 p-4 block
                    bg-white/95 dark:bg-neutral-900/95
                    border border-neutral-200 dark:border-neutral-700
                    rounded shadow-lg
                    -translate-x-1/2 left-1/2 bottom-full mb-3
                    ${showTooltip ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                {...handlers}
            >
                <span className="block text-sm font-serif leading-relaxed text-neutral-800 dark:text-neutral-200">
                    <span className="block font-semibold">
                        {author}{year && `, ${year}`}
                    </span>
                    {title && (
                        <span className="block mt-1 italic text-neutral-600 dark:text-neutral-400">
                            {title}
                        </span>
                    )}
                    {venue && (
                        <span className="block mt-1 text-xs text-neutral-500">
                            {venue}
                        </span>
                    )}
                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                            {url}
                        </a>
                    )}
                </span>
                {/* Arrow */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 block
                    border-l-[6px] border-r-[6px] border-t-[6px]
                    border-transparent border-t-white/95 dark:border-t-neutral-900/95" />
            </span>
        </span>
    );
}

export function Bibliography() {
    const { citations } = useContext(CitationContext);

    if (citations.length === 0) return null;

    return (
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white font-serif tracking-tight">
                References
            </h2>
            <ol className="space-y-3 list-none p-0 m-0">
                {citations.map(({ number, author, year, title, url, venue }) => (
                    <li
                        key={number}
                        id={`citation-${number}`}
                        className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed scroll-mt-24"
                    >
                        <span className="flex-shrink-0 font-sans text-xs font-medium w-6 text-right citation-marker">
                            [{number}]
                        </span>
                        <div className="flex-1">
                            <span className="font-medium">{author}</span>
                            {year && <span className="text-neutral-500"> ({year})</span>}
                            {title && <span>. {title}</span>}
                            {venue && <span className="italic text-neutral-500">. {venue}</span>}
                            {url && (
                                <span>
                                    . <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                    >
                                        [link]
                                    </a>
                                </span>
                            )}
                            <a
                                href={`#ref-${number}`}
                                className="ml-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs"
                                title="Back to citation"
                            >
                                ↩
                            </a>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function Cite({ children, ...props }) {
    return <Citation {...props}>{children}</Citation>;
}
