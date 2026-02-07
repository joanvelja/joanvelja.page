'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for managing hover tooltip visibility with delayed hide.
 * @param {number} delay - Delay in ms before hiding tooltip (default: 250)
 * @returns {{ show: boolean, handlers: { onMouseEnter: () => void, onMouseLeave: () => void } }}
 */
export function useHoverTooltip(delay = 250) {
    const [show, setShow] = useState(false);
    const hideTimeoutRef = useRef(null);

    const onMouseEnter = useCallback(() => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setShow(true);
    }, []);

    const onMouseLeave = useCallback(() => {
        hideTimeoutRef.current = setTimeout(() => {
            setShow(false);
        }, delay);
    }, [delay]);

    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    return { show, handlers: { onMouseEnter, onMouseLeave } };
}
