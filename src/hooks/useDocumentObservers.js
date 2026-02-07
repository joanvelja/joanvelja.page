'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useDocumentObservers() {
    const [activeHeadingId, setActiveHeadingId] = useState('');
    const [headings, setHeadings] = useState([]);
    const headingElementsRef = useRef([]);
    const observerRef = useRef(null);

    useEffect(() => {
        const extractHeadings = () => {
            const container = document.querySelector('article') || document.querySelector('main') || document.body;
            const elements = Array.from(container.querySelectorAll('h1[id], h2[id], h3[id], h4[id]'));
            headingElementsRef.current = elements;

            setHeadings(elements.map(el => ({
                id: el.id,
                text: el.textContent,
                level: parseInt(el.tagName.substring(1)),
            })));
        };

        extractHeadings();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0) {
                        setActiveHeadingId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -80% 0px', threshold: 0 }
        );

        headingElementsRef.current.forEach(el => {
            observerRef.current.observe(el);
        });

        const container = document.querySelector('article') || document.querySelector('main');
        let mutationObserver = null;
        if (container) {
            mutationObserver = new MutationObserver(() => {
                extractHeadings();
                headingElementsRef.current.forEach(el => {
                    observerRef.current.observe(el);
                });
            });
            mutationObserver.observe(container, { childList: true, subtree: true });
        }

        return () => {
            observerRef.current?.disconnect();
            mutationObserver?.disconnect();
        };
    }, []);

    const scrollToHeading = useCallback((id) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            });
            setActiveHeadingId(id);
        }
    }, []);

    return {
        headings,
        activeHeadingId,
        scrollToHeading,
    };
}
