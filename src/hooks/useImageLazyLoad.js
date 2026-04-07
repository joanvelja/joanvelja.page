'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

const sharedObservers = new Map();

function getSharedObserver(rootMargin, threshold) {
  const key = `${rootMargin}|${threshold}`;
  if (sharedObservers.has(key)) return sharedObservers.get(key);

  const callbacks = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cb = callbacks.get(entry.target);
          if (cb) {
            cb();
            observer.unobserve(entry.target);
            callbacks.delete(entry.target);
          }
        }
      }
    },
    { rootMargin, threshold }
  );

  const shared = { observer, callbacks };
  sharedObservers.set(key, shared);
  return shared;
}

export function useImageLazyLoad({ rootMargin = '200px 0px', threshold = 0 } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const { observer, callbacks } = getSharedObserver(rootMargin, threshold);
    callbacks.set(element, () => setIsVisible(true));
    observer.observe(element);

    return () => {
      observer.unobserve(element);
      callbacks.delete(element);
    };
  }, [rootMargin, threshold, isVisible]);

  const onLoad = useCallback(() => setHasLoaded(true), []);

  return { ref, isVisible, hasLoaded, onLoad };
}
