'use client';

import { useRef, useEffect } from 'react';

export function usePreloadImages(photos, currentIndex, isOpen) {
  const preloadedRef = useRef(new Set());
  const linksRef = useRef([]);

  useEffect(() => {
    if (!isOpen || currentIndex === null) return;

    const indices = [currentIndex - 2, currentIndex - 1, currentIndex + 1, currentIndex + 2]
      .filter(i => i >= 0 && i < photos.length);

    indices.forEach(i => {
      const src = photos[i].src;
      if (preloadedRef.current.has(src)) return;
      preloadedRef.current.add(src);

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      linksRef.current.push(link);
    });

    const currentLinks = linksRef.current;
    const currentPreloaded = preloadedRef.current;
    return () => {
      currentLinks.forEach(link => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
      linksRef.current = [];
      currentPreloaded.clear();
    };
  }, [photos, currentIndex, isOpen]);
}
