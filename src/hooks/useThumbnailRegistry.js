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

  const getElement = useCallback((id) => {
    return elementsRef.current.get(id) || null;
  }, []);

  return { register, getElement };
}
