'use client';

import { useRef, useEffect, useMemo, forwardRef } from 'react';
import { useFluidSimulation } from '@/hooks/useFluidSimulation';

const TILE_COLOR_MAP = {
    light: {
        sky: { hot: [0.055, 0.647, 0.914], cold: [0.118, 0.227, 0.373], equilibrium: [0.96, 0.96, 0.96] },
        emerald: { hot: [0.063, 0.725, 0.506], cold: [0.024, 0.306, 0.231], equilibrium: [0.96, 0.96, 0.96] },
        red: { hot: [0.937, 0.267, 0.267], cold: [0.498, 0.114, 0.114], equilibrium: [0.96, 0.96, 0.96] },
        yellow: { hot: [0.918, 0.702, 0.031], cold: [0.443, 0.247, 0.071], equilibrium: [0.96, 0.96, 0.96] },
        purple: { hot: [0.659, 0.333, 0.969], cold: [0.231, 0.027, 0.392], equilibrium: [0.96, 0.96, 0.96] },
    },
    dark: {
        sky: { hot: [0.220, 0.741, 0.973], cold: [0.047, 0.290, 0.431], equilibrium: [0.15, 0.15, 0.15] },
        emerald: { hot: [0.204, 0.827, 0.600], cold: [0.024, 0.373, 0.275], equilibrium: [0.15, 0.15, 0.15] },
        red: { hot: [0.973, 0.443, 0.443], cold: [0.600, 0.106, 0.106], equilibrium: [0.15, 0.15, 0.15] },
        yellow: { hot: [0.980, 0.800, 0.082], cold: [0.522, 0.302, 0.055], equilibrium: [0.15, 0.15, 0.15] },
        purple: { hot: [0.753, 0.518, 0.988], cold: [0.345, 0.110, 0.529], equilibrium: [0.15, 0.15, 0.15] },
    }
};

export const FluidCanvas = forwardRef(function FluidCanvas({
    intensityRef,
    onUpdateIntensity,
    tileColor = 'sky',
    theme = 'light',
    className = ''
}, ref) {
    const canvasRef = useRef(null);
    const { start, stop, updateIntensity, updateColors } = useFluidSimulation(canvasRef);

    const themeKey = theme === 'dark' ? 'dark' : 'light';
    const colors = useMemo(
        () => TILE_COLOR_MAP[themeKey][tileColor] || TILE_COLOR_MAP[themeKey].sky,
        [themeKey, tileColor]
    );

    useEffect(() => {
        if (ref) {
            if (typeof ref === 'function') {
                ref(canvasRef.current);
            } else {
                ref.current = canvasRef.current;
            }
        }
    }, [ref]);

    useEffect(() => {
        if (onUpdateIntensity) {
            onUpdateIntensity((value, action) => {
                updateIntensity(value);
                if (action === 'enter') {
                    start(colors, { fresh: true });
                } else if (value <= 0.01) {
                    stop();
                }
            });
        }
    }, [onUpdateIntensity, updateIntensity, start, stop, colors]);

    useEffect(() => {
        updateColors(colors);
    }, [colors, updateColors]);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return (
        <canvas
            ref={canvasRef}
            width={64}
            height={64}
            className={`absolute inset-0 w-full h-full pointer-events-none rounded-xl ${className}`}
            style={{ opacity: 0 }}
        />
    );
});
