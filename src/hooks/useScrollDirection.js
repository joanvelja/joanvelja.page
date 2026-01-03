'use client';

import { useState, useEffect, useRef } from 'react';
import { throttle } from '@/lib/utils';

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState(null);
    const [isAtTop, setIsAtTop] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

    useEffect(() => {
        const updateScrollDirection = () => {
            const scrollY = window.scrollY;
            const direction = scrollY > lastScrollY.current ? 'down' : 'up';

            if (Math.abs(scrollY - lastScrollY.current) > 10) {
                setScrollDirection(direction);
            }

            setIsAtTop(scrollY < 10);
            setIsAtBottom(window.innerHeight + scrollY >= document.body.offsetHeight - 10);

            lastScrollY.current = scrollY > 0 ? scrollY : 0;
        };

        const throttledUpdateScrollDirection = throttle(updateScrollDirection, 100);

        window.addEventListener('scroll', throttledUpdateScrollDirection, { passive: true });
        return () => {
            window.removeEventListener('scroll', throttledUpdateScrollDirection);
        };
    }, []);

    return { scrollDirection, isAtTop, isAtBottom };
}
