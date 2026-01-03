'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { throttle } from '@/lib/utils';

export function TableOfContents() {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    // Cache heading elements and their positions
    const headingElementsRef = useRef([]);
    const headingPositionsRef = useRef([]);

    // Extract headings from the document
    useEffect(() => {
        const extractHeadings = () => {
            const articleContainer = document.querySelector('article') || document.querySelector('main') || document.body;
            const elements = Array.from(articleContainer.querySelectorAll('h1[id], h2[id], h3[id], h4[id]'));
            headingElementsRef.current = elements;

            const headingData = elements.map(element => ({
                id: element.id,
                text: element.textContent,
                level: parseInt(element.tagName.substring(1)),
            }));
            setHeadings(headingData);

            // Also update cached positions
            updateHeadingPositions();
        };

        const updateHeadingPositions = () => {
            headingPositionsRef.current = headingElementsRef.current.map(heading => ({
                id: heading.id,
                offsetTop: heading.offsetTop,
            }));
        };

        extractHeadings();

        // Re-extract if the DOM changes (scoped to article/main container)
        const articleContainer = document.querySelector('article') || document.querySelector('main');
        if (articleContainer) {
            const observer = new MutationObserver(extractHeadings);
            observer.observe(articleContainer, { childList: true, subtree: true });
            return () => observer.disconnect();
        }
    }, []);

    // Recalculate heading positions on resize
    useEffect(() => {
        const updateHeadingPositions = () => {
            headingPositionsRef.current = headingElementsRef.current.map(heading => ({
                id: heading.id,
                offsetTop: heading.offsetTop,
            }));
        };

        const throttledResize = throttle(updateHeadingPositions, 100);
        window.addEventListener('resize', throttledResize);

        return () => window.removeEventListener('resize', throttledResize);
    }, []);

    // Track active heading based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const viewportOffset = 150;

            // Use cached heading elements and get their current positions
            const headingPositions = headingElementsRef.current.map(heading => {
                const rect = heading.getBoundingClientRect();
                return { id: heading.id, top: rect.top };
            });

            // Bias towards headings near the top, but not too far above
            const activeHeading = headingPositions.reduce((closest, current) => {
                if (current.top <= viewportOffset && current.top > closest.top) {
                    return current;
                }
                return closest;
            }, { id: '', top: -Infinity });

            setActiveId(activeHeading.id);
        };

        const throttledHandleScroll = throttle(handleScroll, 100);

        window.addEventListener('scroll', throttledHandleScroll, { passive: true });
        handleScroll(); // Call on initial render

        return () => window.removeEventListener('scroll', throttledHandleScroll);
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
            fixed left-4 top-32 z-40
            transition-transform duration-300 ease-in-out
            xl:block hidden
            ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%-24px)]'}
        `}>
            <div className="flex">
                <nav className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm
                              border-y border-l border-neutral-200/50 dark:border-neutral-800/50
                              p-4 rounded-l-md max-h-[70vh] overflow-y-auto w-64
                              shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.1)]
                              scrollbar-thin scrollbar-thumb-neutral-300/50 dark:scrollbar-thumb-neutral-700/50
                              scrollbar-track-transparent">
                    <div className="text-center mb-5">
                        <div className="inline-block h-[1px] w-10 bg-neutral-300 dark:bg-neutral-700 mb-3"></div>
                        <h2 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 uppercase font-serif tracking-[0.2em]">
                            Contents
                        </h2>
                        <div className="inline-block h-[1px] w-10 bg-neutral-300 dark:bg-neutral-700 mt-3"></div>
                    </div>

                    <ul className="space-y-2.5">
                        {headings.map(heading => (
                            <li
                                key={heading.id}
                                style={{
                                    paddingLeft: `${(heading.level - 1) * 0.75}rem`,
                                }}
                                className="text-[0.95rem] font-serif"
                            >
                                <a
                                    href={`#${heading.id}`}
                                    onClick={(e) => handleClick(e, heading.id)}
                                    className={`
                                        block py-1.5 px-2 rounded transition-colors
                                        hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50
                                        ${activeId === heading.id ?
                                            'text-blue-600/90 dark:text-blue-400/90 font-medium' :
                                            'text-neutral-700/90 dark:text-neutral-300/90'}
                                        leading-snug tracking-[0.01em]
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
                    className="flex items-center justify-center h-10 w-6 self-start mt-2
                              bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm
                              border-y border-r border-neutral-200/50 dark:border-neutral-800/50
                              rounded-r-md shadow-sm"
                    aria-label={isOpen ? "Collapse table of contents" : "Expand table of contents"}
                >
                    {isOpen ? <ChevronLeft className="text-neutral-600 dark:text-neutral-400" size={14} /> : <ChevronRight className="text-neutral-600 dark:text-neutral-400" size={14} />}
                </button>
            </div>

            {/* Mobile/Inline TOC for smaller screens */}
            <div className="xl:hidden block mt-6 mb-8 mx-auto max-w-[800px] px-4">
                <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none
                                      py-2 px-4 bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm
                                      border border-neutral-200/40 dark:border-neutral-700/40 rounded-md">
                        <h2 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 uppercase font-serif tracking-wider">
                            Table of Contents
                        </h2>
                        <span className="transform group-open:rotate-180 transition-transform duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 dark:text-neutral-400">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </span>
                    </summary>
                    <div className="mt-2 py-3 px-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm
                                 border border-neutral-200/40 dark:border-neutral-700/40 rounded-md">
                        <ul className="space-y-2">
                            {headings.map(heading => (
                                <li
                                    key={heading.id}
                                    style={{
                                        paddingLeft: `${(heading.level - 1) * 0.75}rem`,
                                    }}
                                    className="text-[0.95rem] font-serif"
                                >
                                    <a
                                        href={`#${heading.id}`}
                                        className={`
                                            block py-1.5 px-1 rounded transition-colors
                                            hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50
                                            ${activeId === heading.id ?
                                                'text-blue-600/90 dark:text-blue-400/90 font-medium' :
                                                'text-neutral-700/90 dark:text-neutral-300/90'}
                                            leading-snug tracking-[0.01em]
                                        `}
                                    >
                                        {heading.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            </div>
        </div>
    );
} 