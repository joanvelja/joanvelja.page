'use client';

import React, { useRef, useEffect } from 'react';

export function ReadingProgress() {
    const barRef = useRef(null);

    useEffect(() => {
        let ticking = false;
        const updateProgress = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    const total = document.documentElement.scrollHeight - window.innerHeight;
                    if (barRef.current) {
                        barRef.current.style.width = `${(scrolled / total) * 100}%`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 bg-neutral-100 dark:bg-neutral-800">
            <div
                ref={barRef}
                className="h-full bg-neutral-900 dark:bg-white transition-all duration-150"
                style={{ width: '0%' }}
            />
        </div>
    );
}
