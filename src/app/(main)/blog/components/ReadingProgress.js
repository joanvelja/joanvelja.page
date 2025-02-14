'use client';

import React, { useState, useEffect } from 'react';

export function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            setProgress((scrolled / total) * 100);
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 bg-neutral-100 dark:bg-neutral-800">
            <div 
                className="h-full bg-neutral-900 dark:bg-white transition-all duration-150"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
} 