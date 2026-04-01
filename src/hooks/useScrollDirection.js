'use client';

import { useEffect, useRef } from 'react';

export function useScrollDirection(dockRef, headerRef) {
    const lastScrollY = useRef(0);
    const hiddenRef = useRef(false);
    const scrollAccumulator = useRef(0);

    useEffect(() => {
        const THRESHOLD = 40;

        const onScroll = () => {
            const scrollY = window.scrollY;
            const isAtTop = scrollY < 10;
            const isAtBottom =
                window.innerHeight + scrollY >= document.documentElement.scrollHeight - 10;

            const delta = scrollY - lastScrollY.current;
            lastScrollY.current = scrollY > 0 ? scrollY : 0;

            if ((delta > 0 && scrollAccumulator.current < 0) ||
                (delta < 0 && scrollAccumulator.current > 0)) {
                scrollAccumulator.current = 0;
            }
            scrollAccumulator.current += delta;

            let hidden = hiddenRef.current;
            if (isAtTop || isAtBottom) {
                hidden = false;
                scrollAccumulator.current = 0;
            } else if (scrollAccumulator.current > THRESHOLD) {
                hidden = true;
            } else if (scrollAccumulator.current < -THRESHOLD) {
                hidden = false;
            }

            if (hidden !== hiddenRef.current) {
                hiddenRef.current = hidden;
                if (dockRef.current) {
                    dockRef.current.setAttribute('data-hidden', hidden);
                }
            }

            if (headerRef.current) {
                headerRef.current.setAttribute('data-scrolled', !isAtTop);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [dockRef, headerRef]);
}
