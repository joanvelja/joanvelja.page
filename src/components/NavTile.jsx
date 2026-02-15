'use client';

import { memo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FluidCanvas } from './FluidCanvas';

const TILE_COLOR_KEY = {
    'group-hover:stroke-sky-500': 'sky',
    'group-hover:stroke-emerald-500': 'emerald',
    'group-hover:stroke-red-500': 'red',
    'group-hover:stroke-yellow-500': 'yellow',
    'group-hover:stroke-purple-500': 'purple',
};

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hasCoarsePointer = () =>
    typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

export const NavTile = memo(function NavTile({
    href,
    icon: Icon,
    name,
    colorClass,
    isActive,
    theme,
}) {
    const intensityRef = useRef(0);
    const animationRef = useRef(null);
    const startTimeRef = useRef(0);
    const hoveredRef = useRef(false);
    const canvasElRef = useRef(null);
    const fluidCanvasRef = useRef(null);
    const actionSentRef = useRef(false);

    const tileColor = TILE_COLOR_KEY[colorClass] || 'sky';
    const skipFluid = hasCoarsePointer() || prefersReducedMotion();

    const animate = useCallback((isEnter) => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const startIntensity = intensityRef.current;
        startTimeRef.current = window.performance.now();
        actionSentRef.current = false;

        const tick = () => {
            const elapsed = window.performance.now() - startTimeRef.current;

            if (isEnter) {
                const progress = Math.min(elapsed / 400, 1);
                intensityRef.current = 1 - Math.pow(1 - progress, 3);
            } else {
                const progress = Math.min(elapsed / 600, 1);
                intensityRef.current = startIntensity * Math.pow(1 - progress, 2);
            }

            if (canvasElRef.current) {
                canvasElRef.current.style.opacity = Math.max(intensityRef.current, 0);
            }
            if (fluidCanvasRef.current) {
                if (isEnter && !actionSentRef.current) {
                    fluidCanvasRef.current(intensityRef.current, 'enter');
                    actionSentRef.current = true;
                } else {
                    fluidCanvasRef.current(intensityRef.current, null);
                }
            }

            const done = isEnter
                ? intensityRef.current >= 1
                : intensityRef.current < 0.01;

            if (!done) {
                animationRef.current = requestAnimationFrame(tick);
            } else {
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const onMouseEnter = useCallback(() => {
        hoveredRef.current = true;
        animate(true);
    }, [animate]);

    const onMouseLeave = useCallback(() => {
        hoveredRef.current = false;
        animate(false);
    }, [animate]);

    return (
        <div
            className="flex flex-col items-center group relative"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Link
                title={name}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`nomblhighlight flex flex-col items-center justify-center p-[10px] rounded-xl shadow-sm
                bg-white/90 dark:bg-neutral-900/90 fill-neutral-600/90 border border-neutral-200/80 dark:border-neutral-700/80
                transition-all ease-in-out duration-300
                hover:shadow-md hover:-translate-y-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:fill-neutral-500
                active:scale-95 active:shadow-sm
                relative overflow-hidden
                ${isActive ? 'bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600' : ''}`}
            >
                {!skipFluid && (
                    <FluidCanvas
                        ref={canvasElRef}
                        intensityRef={intensityRef}
                        onUpdateIntensity={(fn) => { fluidCanvasRef.current = fn; }}
                        tileColor={tileColor}
                        theme={theme}
                    />
                )}
                <Icon
                    size={28}
                    className={`stroke-neutral-700 dark:stroke-neutral-200 transition-all ease-in-out ${colorClass} relative z-10`}
                />
            </Link>
            {isActive && (
                <div className="absolute -bottom-3 w-4 h-0.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-fade-in" />
            )}
        </div>
    );
});
