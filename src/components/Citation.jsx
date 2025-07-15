'use client';

import React, { useState, useContext, useEffect, useRef } from 'react';

// Citation Context for managing citations across the document
const CitationContext = React.createContext();

export function CitationProvider({ children }) {
    const [citations, setCitations] = useState([]);
    const citationMap = useRef(new Map());
    
    const addCitation = (citation) => {
        // Create a unique key from citation data
        const key = citation.key || `${citation.author}-${citation.year}`;
        
        // If we've seen this citation before, return its number
        if (citationMap.current.has(key)) {
            return citationMap.current.get(key);
        }

        // Otherwise, create a new citation entry
        const number = citationMap.current.size + 1;
        citationMap.current.set(key, number);
        
        // Add to citations array if it's new
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

// Individual Citation component for inline citations
export function Citation({ 
    author, 
    year, 
    title, 
    url, 
    venue,
    key,
    children 
}) {
    const { addCitation } = useContext(CitationContext);
    const [citationNumber, setCitationNumber] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    
    useEffect(() => {
        const number = addCitation({
            author,
            year,
            title,
            url,
            venue,
            key
        });
        setCitationNumber(number);
    }, [addCitation, author, year, title, url, venue, key]);

    if (!citationNumber) return null;

    return (
        <span 
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <a 
                href={`#citation-${citationNumber}`}
                id={`ref-${citationNumber}`}
                className="citation-link text-blue-600 dark:text-blue-400 hover:underline font-sans transition-colors duration-200"
            >
                [{citationNumber}]
            </a>
            
            {/* Custom tooltip matching your site's theme */}
            {showTooltip && (title || author) && (
                <div className="absolute z-50 w-64 p-3 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 left-1/2">
                    <div className="text-sm text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed">
                        <div className="font-medium text-neutral-900 dark:text-white">
                            {author} {year && `(${year})`}
                        </div>
                        {title && (
                            <div className="mt-1 text-neutral-600 dark:text-neutral-400 italic">
                                "{title}"
                            </div>
                        )}
                        {venue && (
                            <div className="mt-1 text-neutral-500 dark:text-neutral-500 text-xs">
                                {venue}
                            </div>
                        )}
                    </div>
                    {/* Arrow pointing up */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white dark:border-b-neutral-800"></div>
                </div>
            )}
        </span>
    );
}

// Bibliography component to render all citations
export function Bibliography() {
    const { citations } = useContext(CitationContext);
    
    if (citations.length === 0) return null;

    return (
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white font-serif">
                References
            </h2>
            <div className="space-y-4">
                {citations.map(({ number, author, year, title, url, venue }) => (
                    <div 
                        key={number} 
                        id={`citation-${number}`} 
                        className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed group"
                    >
                        <div className="flex items-start gap-2 min-w-[2.5rem]">
                            <span className="font-sans font-medium text-neutral-600 dark:text-neutral-400">
                                [{number}]
                            </span>
                            <a 
                                href={`#ref-${number}`}
                                className="text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-xs mt-0.5"
                                title="Return to citation in text"
                            >
                                ↩
                            </a>
                        </div>
                        <div>
                            <span className="font-medium">{author}</span>
                            {year && <span> ({year})</span>}
                            {title && <span>. "{title}"</span>}
                            {venue && <span>. <em>{venue}</em></span>}
                            {url && (
                                <span>. <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
                                >
                                    {url}
                                </a></span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Simple citation format for quick references
export function Cite({ children, ...props }) {
    return <Citation {...props}>{children}</Citation>;
} 