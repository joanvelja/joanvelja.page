'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export function useImageLazyLoad({ rootMargin = '200px 0px', threshold = 0 } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold, isVisible]);

  const onLoad = useCallback(() => setHasLoaded(true), []);

  return { ref, isVisible, hasLoaded, onLoad };
}
