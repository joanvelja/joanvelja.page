'use client';

import { useEffect, useRef } from 'react';

export function useScrollDirection(dockRef, headerRef) {
    const lastScrollY = useRef(0);
    const directionRef = useRef(null);

    useEffect(() => {
        const onScroll = () => {
            const scrollY = window.scrollY;
            const isAtTop = scrollY < 10;
            const isAtBottom =
                window.innerHeight + scrollY >= document.documentElement.scrollHeight - 10;

            if (Math.abs(scrollY - lastScrollY.current) > 10) {
                directionRef.current = scrollY > lastScrollY.current ? 'down' : 'up';
            }

            lastScrollY.current = scrollY > 0 ? scrollY : 0;

            const hidden = directionRef.current === 'down' && !isAtBottom;

            if (dockRef.current) {
                dockRef.current.setAttribute('data-hidden', hidden);
            }
            if (headerRef.current) {
                headerRef.current.setAttribute('data-scrolled', !isAtTop);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [dockRef, headerRef]);
}
