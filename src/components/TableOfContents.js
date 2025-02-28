'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';


export function TableOfContents() {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    
    // Extract headings from the document
    useEffect(() => {
        const extractHeadings = () => {
            const elements = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]'));
            const headingData = elements.map(element => ({
                id: element.id,
                text: element.textContent,
                level: parseInt(element.tagName.substring(1)),
            }));
            setHeadings(headingData);
        };
        
        extractHeadings();
        
        // Re-extract if the DOM changes (useful for dynamic content)
        const observer = new MutationObserver(extractHeadings);
        observer.observe(document.body, { childList: true, subtree: true });
        
        return () => observer.disconnect();
    }, []);
    
    // Track active heading based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const headingElements = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]'));
            
            // Find the heading closest to the top of the viewport
            const headingPositions = headingElements.map(heading => {
                const rect = heading.getBoundingClientRect();
                return { id: heading.id, top: rect.top };
            });
            
            // Bias towards headings near the top, but not too far above
            const activeHeading = headingPositions.reduce((closest, current) => {
                if (current.top <= 150 && current.top > closest.top) {
                    return current;
                }
                return closest;
            }, { id: '', top: -Infinity });
            
            setActiveId(activeHeading.id);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Call on initial render
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Handle clicking a TOC item
    const handleClick = useCallback((e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100, // Offset for fixed header
                behavior: 'smooth'
            });
            setActiveId(id);
        }
    }, []);
    
    if (headings.length === 0) return null;
    
    return (
        <div className={`
            fixed left-0 top-1/2 transform -translate-y-1/2 z-40
            transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%-30px)]'}
        `}>
            <div className="flex">
                <nav className="bg-white dark:bg-neutral-900 border-y border-r border-neutral-200 dark:border-neutral-800 p-1 shadow-md rounded-r-md max-h-[60vh] overflow-y-auto
                              scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700
                              scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600">
                    <h2 className="text-sm font-bold mb-3 text-neutral-800 dark:text-neutral-200 uppercase">
                        Table of Contents
                    </h2>
                    <ul className="space-y-2 min-w-[220px] max-w-[220px]">
                        {headings.map(heading => (
                            <li 
                                key={heading.id}
                                style={{ 
                                    paddingLeft: `${(heading.level - 1) * 0.75}rem`,
                                }} 
                                className="text-sm"
                            >
                                <a
                                    href={`#${heading.id}`}
                                    onClick={(e) => handleClick(e, heading.id)}
                                    className={`
                                        block py-1 px-2 rounded transition-colors
                                        hover:bg-neutral-100 dark:hover:bg-neutral-800
                                        ${activeId === heading.id ? 
                                            'text-blue-600 dark:text-blue-400 font-medium' : 
                                            'text-neutral-700 dark:text-neutral-300'}
                                    `}
                                >
                                    {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center h-10 w-6 self-center
                              bg-white dark:bg-neutral-800 border-y border-r border-neutral-200 
                              dark:border-neutral-800 rounded-r-md shadow-md"
                    aria-label={isOpen ? "Collapse table of contents" : "Expand table of contents"}
                >
                    {isOpen ? <ChevronLeft className="text-neutral-800 dark:text-neutral-200" size={14} /> : <ChevronRight className="text-neutral-800 dark:text-neutral-200" size={14} />}
                </button>
            </div>
        </div>
    );
} 