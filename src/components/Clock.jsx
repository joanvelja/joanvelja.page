'use client';

import { useEffect, useRef, memo } from 'react';

function formatTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

export const Clock = memo(function Clock() {
    const spanRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (spanRef.current) {
                spanRef.current.textContent = formatTime();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return <span ref={spanRef} className="font-light text-neutral-600 dark:text-neutral-400 text-sm md:text-base font-sans">{formatTime()}</span>;
});
