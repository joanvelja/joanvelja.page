'use client';

import { useContext, useRef } from 'react';
import { SidenotesContext } from './Sidenotes';
import { useHoverTooltip } from '@/hooks/useHoverTooltip';

export function Sidenote({ children }) {
    const { addNote } = useContext(SidenotesContext);
    const { show: showTooltip, handlers } = useHoverTooltip();
    const noteNumberRef = useRef(null);

    if (noteNumberRef.current === null) {
        noteNumberRef.current = addNote(children);
    }
    const noteNumber = noteNumberRef.current;

    return (
        <span
            className="relative inline"
            {...handlers}
        >
            <a
                href={`#sidenote-${noteNumber}`}
                id={`sidenote-ref-${noteNumber}`}
                className="cursor-help no-underline relative top-[-2px]"
            >
                <sup className="font-sans font-medium text-[75%] leading-none citation-marker">
                    {noteNumber}
                </sup>
            </a>

            <span
                className={`
                    absolute z-tooltip w-72 p-4 block
                    bg-white/95 dark:bg-neutral-900/95
                    border border-neutral-200 dark:border-neutral-700
                    rounded shadow-lg
                    -translate-x-1/2 left-1/2 bottom-full mb-3
                    ${showTooltip ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                {...handlers}
            >
                <span className="block text-sm text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed">
                    {children}
                </span>
                {/* Arrow */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 block
                    border-l-[6px] border-r-[6px] border-t-[6px]
                    border-transparent border-t-white/95 dark:border-t-neutral-900/95" />
            </span>
        </span>
    );
}
