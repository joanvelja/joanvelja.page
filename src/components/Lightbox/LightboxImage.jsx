'use client';

import { useRef, useCallback, useEffect } from 'react';
import { LazyMotion, domAnimation, m, useMotionValue, useSpring } from 'framer-motion';
import { useGesture } from '@use-gesture/react';

const SPRINGS = {
  morph: { stiffness: 130, damping: 19, mass: 1 },
  snapBack: { stiffness: 400, damping: 35, mass: 1 },
  zoom: { stiffness: 300, damping: 30, mass: 0.8 },
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DISMISS_THRESHOLD = 150;
const DISMISS_VELOCITY = 500;
const ZOOM_HYSTERESIS = 1.1;

export function LightboxImage({ photo, onDismiss, onImageError }) {
  const containerRef = useRef(null);
  const zoomStateRef = useRef('FIT'); // FIT | ZOOMING | ZOOMED | RESETTING
  const lastTapRef = useRef(0);

  const rawScale = useMotionValue(1);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const opacity = useMotionValue(1);

  const scale = useSpring(rawScale, SPRINGS.zoom);
  const x = useSpring(rawX, SPRINGS.snapBack);
  const y = useSpring(rawY, SPRINGS.snapBack);

  useEffect(() => {
    rawScale.set(1);
    rawX.set(0);
    rawY.set(0);
    opacity.set(1);
    zoomStateRef.current = 'FIT';
  }, [photo.src, rawScale, rawX, rawY, opacity]);

  const handleDoubleTap = useCallback(() => {
    if (zoomStateRef.current === 'ZOOMED') {
      zoomStateRef.current = 'RESETTING';
      rawScale.set(1);
      rawX.set(0);
      rawY.set(0);
      const unsub = scale.on('change', (v) => {
        if (Math.abs(v - 1) < 0.01) {
          zoomStateRef.current = 'FIT';
          unsub();
        }
      });
    } else {
      zoomStateRef.current = 'ZOOMED';
      rawScale.set(2.5);
    }
  }, [rawScale, rawX, rawY, scale]);

  useGesture(
    {
      onDrag: ({ offset: [ox, oy], memo }) => {
        const currentScale = rawScale.get();

        if (currentScale <= ZOOM_HYSTERESIS) {
          rawY.set(oy);
          const progress = Math.min(Math.abs(oy) / (DISMISS_THRESHOLD * 2), 1);
          opacity.set(1 - progress * 0.5);

          return memo;
        }

        rawX.set(ox);
        rawY.set(oy);
        return memo;
      },
      onDragEnd: ({ offset: [, oy], velocity: [, vy] }) => {
        const currentScale = rawScale.get();

        if (currentScale <= ZOOM_HYSTERESIS) {
          if (Math.abs(oy) > DISMISS_THRESHOLD || Math.abs(vy) > DISMISS_VELOCITY) {
            onDismiss();
          } else {
            rawY.set(0);
            rawX.set(0);
            opacity.set(1);
          }
          return;
        }

      },
      onPinch: ({ offset: [s], memo }) => {
        const clamped = Math.min(Math.max(s, MIN_SCALE), MAX_SCALE);
        rawScale.set(clamped);
        zoomStateRef.current = clamped > ZOOM_HYSTERESIS ? 'ZOOMED' : 'ZOOMING';
        return memo;
      },
      onPinchEnd: () => {
        const currentScale = rawScale.get();
        if (currentScale < ZOOM_HYSTERESIS) {
          rawScale.set(1);
          rawX.set(0);
          rawY.set(0);
          zoomStateRef.current = 'FIT';
        } else {
          zoomStateRef.current = 'ZOOMED';
        }
      },
    },
    {
      target: containerRef,
      drag: {
        from: () => [rawX.get(), rawY.get()],
        filterTaps: true,
        pointer: { touch: true },
      },
      pinch: {
        scaleBounds: { min: MIN_SCALE, max: MAX_SCALE },
        from: () => [rawScale.get(), 0],
      },
    }
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      const delta = -e.deltaY * 0.01;
      const current = rawScale.get();
      const next = Math.min(Math.max(current + delta, MIN_SCALE), MAX_SCALE);
      rawScale.set(next);
      zoomStateRef.current = next > ZOOM_HYSTERESIS ? 'ZOOMED' : 'FIT';
    };

    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [rawScale]);

  const handleTap = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('.lightbox-nav-zone')) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [handleDoubleTap]);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ touchAction: 'none', opacity }}
        onClick={handleTap}
      >
        <m.img
          src={photo.src}
          alt={photo.alt || photo.title}
          className="max-w-full max-h-full object-contain select-none"
          style={{ scale, x, y }}
          draggable={false}
          onError={onImageError}
        />
      </m.div>
    </LazyMotion>
  );
}
