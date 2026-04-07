'use client';

import { useRef, useEffect } from 'react';
import { getOptimizedSrc } from '@/lib/utils';

export function usePreloadImages(photos, currentIndex, isOpen) {
  const preloadedRef = useRef(new Set());
  const linksRef = useRef([]);

  useEffect(() => {
    if (!isOpen || currentIndex === null) return;

    const indices = [currentIndex - 1, currentIndex + 1]
      .filter(i => i >= 0 && i < photos.length);

    indices.forEach(i => {
      const src = photos[i].src;
      if (preloadedRef.current.has(src)) return;
      preloadedRef.current.add(src);

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getOptimizedSrc(src);
      document.head.appendChild(link);
      linksRef.current.push(link);
    });
  }, [photos, currentIndex, isOpen]);

  useEffect(() => {
    if (isOpen) return;

    const currentLinks = linksRef.current;
    currentLinks.forEach(link => {
      if (link.parentNode) link.parentNode.removeChild(link);
    });
    linksRef.current = [];
    preloadedRef.current.clear();
  }, [isOpen]);
}
