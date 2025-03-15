"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

/**
 * A component that wraps images with light backgrounds to make them
 * more visually appealing in dark mode by adding soft edges and a subtle container
 */
export function DarkModeImageWrapper({ 
  src, 
  alt, 
  className = "",
  rounded = "rounded-lg", // default rounded corners
  softEdge = true,        // whether to add gradient edges
  borderStyle = "border border-neutral-200/30 dark:border-neutral-700/30", // subtle border
  containerStyle = "bg-neutral-100/30 dark:bg-neutral-800/30", // container background
  isCoverImage = false,   // special handling for cover images
}) {
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle image load to get actual dimensions
  const handleImageLoad = (e) => {
    if (e.target) {
      setImageDimensions({
        width: e.target.naturalWidth,
        height: e.target.naturalHeight
      });
    }
  };
  
  // Don't render during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div 
        className={`
          relative overflow-hidden ${rounded} ${borderStyle} ${containerStyle}
          ${isCoverImage ? 'p-1' : 'p-0.5'}
          transition-all duration-300 ease-in-out
        `}
      >
        <div className={`relative ${className}`}>
          {typeof src === 'string' ? (
            <img 
              src={src} 
              alt={alt}
              className={`
                w-full h-auto ${rounded}
                transition-all duration-300 ease-in-out
              `}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              className={`
                w-full h-auto ${rounded}
                transition-all duration-300 ease-in-out
              `}
            />
          )}
        </div>
      </div>
    );
  }
  
  const isDarkMode = resolvedTheme === 'dark';
  
  // Cover images have specific styling
  if (isCoverImage) {
    return (
      <div 
        className={`
          relative overflow-hidden ${rounded} ${borderStyle} ${containerStyle}
          backdrop-blur-[2px] p-1
          transition-all duration-300 ease-in-out
        `}
      >
        <div className={`relative ${className}`}>
          {typeof src === 'string' ? (
            <img 
              src={src} 
              alt={alt}
              className={`
                w-full h-auto ${rounded} 
                ${softEdge && isDarkMode ? 'dark-mode-image' : ''}
                transition-all duration-300 ease-in-out
              `}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              className={`
                w-full h-auto ${rounded} 
                ${softEdge && isDarkMode ? 'dark-mode-image' : ''}
                transition-all duration-300 ease-in-out
              `}
            />
          )}
        </div>
      </div>
    );
  }
  
  // Regular images get tighter styling
  return (
    <div 
      className={`
        relative overflow-hidden ${rounded} ${borderStyle} ${containerStyle}
        p-0.5
        transition-all duration-300 ease-in-out
      `}
    >
      <div className={`relative ${className}`}>
        {typeof src === 'string' ? (
          <img 
            src={src} 
            alt={alt}
            onLoad={handleImageLoad}
            className={`
              w-full h-auto ${rounded} 
              ${softEdge && isDarkMode ? 'dark-mode-image' : ''}
              transition-all duration-300 ease-in-out
            `}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            className={`
              w-full h-auto ${rounded} 
              ${softEdge && isDarkMode ? 'dark-mode-image' : ''}
              transition-all duration-300 ease-in-out
            `}
          />
        )}
      </div>
    </div>
  );
}

// Usage example:
// <DarkModeImageWrapper 
//   src="/path/to/image.jpg" 
//   alt="Description" 
//   className="w-full aspect-video"
// /> 