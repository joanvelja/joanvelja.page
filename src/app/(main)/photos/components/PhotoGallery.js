'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
}

export function PhotoGallery({ photos }) {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    // Determine if a photo should span the full width
    const shouldSpanFull = (photo) => {
        const [width, height] = photo.aspectRatio.split('/').map(Number);
        return width > height;
    };

    // Determine if a photo should be centered (vertical photo in a row by itself)
    const shouldCenter = (photo, index, photos) => {
        if (shouldSpanFull(photo)) return false;
        
        // Get previous and next photos
        const prevPhoto = photos[index - 1];
        const nextPhoto = photos[index + 1];
        
        // Check if previous photo spans full width
        const prevSpans = prevPhoto && shouldSpanFull(prevPhoto);
        // Check if next photo spans full width
        const nextSpans = nextPhoto && shouldSpanFull(nextPhoto);
        
        // Center if it's between two full-width photos or at edges with a full-width neighbor
        return (prevSpans && (!nextPhoto || nextSpans)) || (!prevPhoto && nextSpans);
    };

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (!hash) {
                setSelectedPhoto(null);
                return;
            }

            const photoName = hash.slice(1);
            const photoIndex = photos.findIndex(photo => {
                const filename = photo.src.split('/').pop().split('.')[0];
                return filename === photoName;
            });
            
            if (photoIndex >= 0) {
                setSelectedPhoto(photoIndex);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('popstate', handleHashChange);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('popstate', handleHashChange);
        };
    }, [photos]);

    const openPhoto = (index) => {
        const filename = photos[index].src.split('/').pop().split('.')[0];
        window.history.pushState({ photo: filename }, '', `${pathname}#${filename}`);
        setSelectedPhoto(index);
    };

    const closePhoto = (e) => {
        e?.stopPropagation();
        window.history.pushState({ photo: null }, '', pathname);
        setSelectedPhoto(null);
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && selectedPhoto !== null) {
                closePhoto();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [selectedPhoto]);

    return (
        <section className="w-full max-w-[1200px] px-4 py-8">
            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[1fr]">
                {photos.map((photo, index) => {
                    const [width, height] = photo.aspectRatio.split('/').map(Number);
                    const paddingTop = `${(height / width) * 100}%`;
                    const isFullSpan = shouldSpanFull(photo);
                    const isCentered = shouldCenter(photo, index, photos);

                    return (
                        <motion.div
                            key={photo.src}
                            layoutId={`photo-${index}`}
                            onClick={() => openPhoto(index)}
                            className={`relative cursor-pointer group ${
                                isFullSpan ? 'col-span-2 md:col-span-3' : ''
                            } ${
                                isCentered ? 'md:col-start-2' : ''
                            }`}
                            style={{ paddingTop }}
                            whileHover={{ 
                                scale: 1.02,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                        >
                            {photo.src ? (
                                <Image
                                    src={photo.src}
                                    alt={photo.alt}
                                    fill
                                    className="absolute inset-0 object-cover rounded-2xl transition-all duration-300
                                             group-hover:shadow-lg"
                                    sizes={isFullSpan 
                                        ? "(max-width: 768px) 100vw, 1200px"
                                        : "(max-width: 768px) 50vw, 33vw"
                                    }
                                />
                            ) : (
                                <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center rounded-2xl">
                                    <span className="text-neutral-400 dark:text-neutral-600">No image</span>
                                </div>
                            )}
                            {/* Hover overlay with metadata */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                                          transition-opacity duration-300 rounded-2xl flex flex-col 
                                          justify-end p-4">
                                <p className="text-white font-medium text-sm font-serif">
                                    {photo.title}
                                </p>
                                <p className="text-white/80 text-xs font-sans">
                                    {formatDate(photo.date)}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Fullscreen Photo View */}
            <AnimatePresence>
                {selectedPhoto !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 flex items-center justify-center z-50"
                        onClick={closePhoto}
                        style={{ perspective: "1000px" }}
                    >
                        {/* Backdrop blur */}
                        <motion.div
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Photo Card */}
                        <motion.div
                            layoutId={`photo-${selectedPhoto}`}
                            className="relative w-[90vw] h-[90vh] md:w-[80vw] md:h-[80vh] max-w-5xl max-h-[80vh] z-10"
                            onClick={(e) => e.stopPropagation()}
                            transition={{
                                layout: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30
                                }
                            }}
                        >
                            <div className="relative w-full h-full rounded-3xl overflow-hidden">
                                {photos[selectedPhoto].src ? (
                                    <Image
                                        src={photos[selectedPhoto].src}
                                        alt={photos[selectedPhoto].alt}
                                        fill
                                        className="object-contain rounded-3xl"
                                        sizes="90vw"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                        <span className="text-neutral-400 dark:text-neutral-600">No image available</span>
                                    </div>
                                )}
                            </div>
                            {/* Metadata overlay */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ delay: 0.2 }}
                                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t 
                                         from-black/60 to-transparent"
                            >
                                <h2 className="text-white text-lg font-medium mb-1 font-serif">
                                    {photos[selectedPhoto].title}
                                </h2>
                                <div className="flex items-center gap-4 text-sm text-white/80 font-sans">
                                    <span>{formatDate(photos[selectedPhoto].date)}</span>
                                    <span>•</span>
                                    <span>{photos[selectedPhoto].dimensions.width} × {photos[selectedPhoto].dimensions.height}</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
} 