'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useMemo, useReducer } from 'react';
import { useThumbnailRegistry } from '@/hooks/useThumbnailRegistry';

const ThumbnailRegistryContext = createContext(null);
const LightboxStateContext = createContext(null);

const initialState = { isOpen: false, currentIndex: null };

function lightboxReducer(state, action) {
  switch (action.type) {
    case 'OPEN':
      return { isOpen: true, currentIndex: action.index };
    case 'CLOSE':
      return { isOpen: false, currentIndex: null };
    case 'SET_INDEX':
      return { ...state, currentIndex: action.index };
    default:
      return state;
  }
}

export function LightboxProvider({ children }) {
  const registry = useThumbnailRegistry();
  const [{ isOpen, currentIndex }, dispatch] = useReducer(lightboxReducer, initialState);
  const photosRef = useRef([]);
  const previousFocusRef = useRef(null);

  const getPhotos = useCallback(() => photosRef.current, []);

  useEffect(() => {
    return () => {
      document.body.classList.remove('lightbox-open');
    };
  }, []);

  const openLightbox = useCallback((index, photos, options = {}) => {
    const { updateUrl = true } = options;
    if (photos) photosRef.current = photos;
    if (!isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.classList.add('lightbox-open');
    }

    dispatch({ type: 'OPEN', index });
    const photo = photosRef.current[index];
    if (updateUrl && photo?.id) {
      window.history.pushState({}, '', `/photos?image=${photo.id}`);
    }
  }, [isOpen]);

  const closeLightbox = useCallback((options = {}) => {
    const { updateUrl = true } = options;
    if (isOpen) {
      document.body.classList.remove('lightbox-open');
      previousFocusRef.current?.focus?.();
      previousFocusRef.current = null;
    }

    dispatch({ type: 'CLOSE' });
    if (updateUrl) {
      window.history.pushState({}, '', '/photos');
    }
  }, [isOpen]);

  const navigate = useCallback((direction) => {
    const photos = photosRef.current;
    if (currentIndex === null) return;
    const next = currentIndex + direction;
    if (next < 0 || next >= photos.length) return;
    dispatch({ type: 'SET_INDEX', index: next });
    const photo = photos[next];
    if (photo?.id) {
      window.history.replaceState({}, '', `/photos?image=${photo.id}`);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handlePopstate = () => {
      const params = new URLSearchParams(window.location.search);
      const imageId = params.get('image');
      if (imageId) {
        const index = photosRef.current.findIndex(p => p.id === imageId);
        if (index >= 0) {
          openLightbox(index, undefined, { updateUrl: false });
        }
      } else {
        closeLightbox({ updateUrl: false });
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [closeLightbox, openLightbox]);

  const setPhotos = useCallback((photos) => {
    photosRef.current = photos;
    const params = new URLSearchParams(window.location.search);
    const imageId = params.get('image');
    if (imageId && !isOpen) {
      const index = photos.findIndex(p => p.id === imageId);
      if (index >= 0) {
        openLightbox(index, undefined, { updateUrl: false });
      }
    }
  }, [isOpen, openLightbox]);

  const stateValue = useMemo(() => ({
    isOpen,
    currentIndex,
    getPhotos,
    openLightbox,
    closeLightbox,
    navigate,
    setPhotos,
  }), [isOpen, currentIndex, getPhotos, openLightbox, closeLightbox, navigate, setPhotos]);

  return (
    <ThumbnailRegistryContext.Provider value={registry}>
      <LightboxStateContext.Provider value={stateValue}>
        {children}
      </LightboxStateContext.Provider>
    </ThumbnailRegistryContext.Provider>
  );
}

export function useThumbnailRegistryContext() {
  const ctx = useContext(ThumbnailRegistryContext);
  if (!ctx) throw new Error('useThumbnailRegistryContext must be used within LightboxProvider');
  return ctx;
}

export function useLightbox() {
  const ctx = useContext(LightboxStateContext);
  if (!ctx) throw new Error('useLightbox must be used within LightboxProvider');
  return ctx;
}
