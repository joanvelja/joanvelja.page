'use client';

import { useState, useEffect, memo } from 'react';

export const Clock = memo(function Clock() {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }));
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!time) return null;

    return <span className="font-light text-neutral-600 dark:text-neutral-400 text-sm md:text-base font-sans">{time}</span>;
});
