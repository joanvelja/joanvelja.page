'use client';

import { useRef, useCallback } from 'react';

export function useThumbnailRegistry() {
  const elementsRef = useRef(new Map());

  const register = useCallback((id, element) => {
    if (element) {
      elementsRef.current.set(id, element);
    } else {
      elementsRef.current.delete(id);
    }
  }, []);

  const getRect = useCallback((id) => {
    const el = elementsRef.current.get(id);
    return el ? el.getBoundingClientRect() : null;
  }, []);

  const getElement = useCallback((id) => {
    return elementsRef.current.get(id) || null;
  }, []);

  return { register, getRect, getElement };
}
