'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FluidCanvas } from './FluidCanvas';

const TILE_COLOR_KEY = {
    'group-hover:stroke-sky-500': 'sky',
    'group-hover:stroke-emerald-500': 'emerald',
    'group-hover:stroke-red-500': 'red',
    'group-hover:stroke-yellow-500': 'yellow',
    'group-hover:stroke-purple-500': 'purple',
};

export function NavTile({
    href,
    icon: Icon,
    name,
    colorClass,
    isActive,
    theme,
    fluidMode = 'thermodynamic'
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [intensity, setIntensity] = useState(0);
    const animationRef = useRef(null);
    const startTimeRef = useRef(0);
    const intensityRef = useRef(intensity);

    const tileColor = TILE_COLOR_KEY[colorClass] || 'sky';

    // Keep intensityRef in sync with intensity state to avoid stale closures
    useEffect(() => {
        intensityRef.current = intensity;
    }, [intensity]);

    useEffect(() => {
        if (isHovered) {
            startTimeRef.current = performance.now();

            const rampUp = () => {
                const elapsed = performance.now() - startTimeRef.current;
                const progress = Math.min(elapsed / 400, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setIntensity(eased);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(rampUp);
                }
            };

            animationRef.current = requestAnimationFrame(rampUp);
        } else {
            // Use ref to get current intensity value, avoiding stale closure
            const startIntensity = intensityRef.current;
            startTimeRef.current = performance.now();

            const decay = () => {
                const elapsed = performance.now() - startTimeRef.current;
                const progress = Math.min(elapsed / 600, 1);
                const eased = Math.pow(1 - progress, 2);
                setIntensity(startIntensity * eased);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(decay);
                }
            };

            animationRef.current = requestAnimationFrame(decay);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isHovered]);

    return (
        <div
            className="flex flex-col items-center group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                title={name}
                href={href}
                className={`nomblhighlight flex flex-col items-center justify-center p-[10px] rounded-xl shadow-sm 
                bg-white/90 dark:bg-neutral-900/90 fill-neutral-600/90 border border-neutral-200/80 dark:border-neutral-700/80
                transition-all ease-in-out duration-300
                hover:shadow-md hover:-translate-y-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:fill-neutral-500
                active:scale-95 active:shadow-sm
                relative overflow-hidden
                ${isActive ? 'bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600' : ''}`}
            >
                <FluidCanvas
                    isActive={isHovered || intensity > 0.01}
                    intensity={intensity}
                    tileColor={tileColor}
                    theme={theme}
                    mode={fluidMode}
                />
                <Icon
                    size={28}
                    className={`stroke-neutral-700 dark:stroke-neutral-200 transition-all ease-in-out ${colorClass} relative z-10`}
                />
            </Link>
            {isActive && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute -bottom-6 stroke-neutral-400 dark:stroke-neutral-600 animate-fade-in"
                >
                    <circle cx="12.1" cy="12.1" r="1"></circle>
                </svg>
            )}
        </div>
    );
}
