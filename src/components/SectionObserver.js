'use client';

import { useEffect, useRef } from 'react';

export function SectionObserver() {
    const observerRef = useRef(null);

    useEffect(() => {
        // Get all heading elements
        const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
        
        // Create intersection observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Only update if we're scrolling down and the element is entering view
                        const rect = entry.boundingClientRect;
                        if (rect.top < window.innerHeight * 0.5) {
                            history.replaceState(null, null, `#${entry.target.id}`);
                        }
                    }
                });
            },
            {
                rootMargin: '-10% 0px -85% 0px', // Trigger when element is 10% from the top
            }
        );

        // Observe all headings
        headings.forEach((heading) => {
            observerRef.current.observe(heading);
        });

        // Cleanup
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return null;
} 