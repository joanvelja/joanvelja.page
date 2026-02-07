'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useThumbnailRegistry } from '@/hooks/useThumbnailRegistry';

const ThumbnailRegistryContext = createContext(null);
const LightboxStateContext = createContext(null);

export function LightboxProvider({ children }) {
  const registry = useThumbnailRegistry();
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  isOpenRef.current = isOpen;
  const [currentIndex, setCurrentIndex] = useState(null);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const photosRef = useRef([]);

  const openLightbox = useCallback((index, photos) => {
    if (photos) photosRef.current = photos;
    setCurrentIndex(index);
    setIsOpen(true);
    const photo = photosRef.current[index];
    if (photo?.id) {
      window.history.pushState({}, '', `/photos?image=${photo.id}`);
    }
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    setCurrentIndex(null);
    window.history.pushState({}, '', '/photos');
  }, []);

  const navigate = useCallback((direction) => {
    const photos = photosRef.current;
    const next = currentIndexRef.current + direction;
    if (next < 0 || next >= photos.length) return;
    setCurrentIndex(next);
    const photo = photos[next];
    if (photo?.id) {
      window.history.replaceState({}, '', `/photos?image=${photo.id}`);
    }
  }, []);

  useEffect(() => {
    const handlePopstate = () => {
      const params = new URLSearchParams(window.location.search);
      const imageId = params.get('image');
      if (imageId) {
        const index = photosRef.current.findIndex(p => p.id === imageId);
        if (index >= 0) {
          setCurrentIndex(index);
          setIsOpen(true);
        }
      } else {
        setIsOpen(false);
        setCurrentIndex(null);
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  const setPhotos = useCallback((photos) => {
    photosRef.current = photos;
    const params = new URLSearchParams(window.location.search);
    const imageId = params.get('image');
    if (imageId && !isOpenRef.current) {
      const index = photos.findIndex(p => p.id === imageId);
      if (index >= 0) {
        setCurrentIndex(index);
        setIsOpen(true);
      }
    }
  }, []);

  const stateValue = {
    isOpen,
    currentIndex,
    photos: photosRef.current,
    openLightbox,
    closeLightbox,
    navigate,
    setPhotos,
  };

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
