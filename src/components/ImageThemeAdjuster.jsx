"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

/**
 * ImageThemeAdjuster - A component for handling images across theme changes
 * 
 * This component offers multiple strategies for making images comfortable to view
 * in both light and dark mode environments. Use "counter-invert" for images that
 * are natively designed for dark mode.
 */
export function ImageThemeAdjuster({
  src,
  alt,
  width,
  height,
  className = "",
  
  // Theme adjustment options
  strategy = "subtle", // "subtle", "invert", "dim", "frame", "vignette", "blend", "counter-invert", "none"
  invertThreshold = 95, // Percentage brightness threshold for auto-inversion in "auto" mode
  customStyles = {}, // Additional CSS styles
  
  // Display options
  showCaption = false,
  caption = "",
  priority = false,
  
  // Layout options
  aspectRatio,
  objectFit = "contain",
  
  // Next.js Image component options
  nextProps = {},
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);
  
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
  
  // Show a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`relative ${aspectRatio ? `aspect-[${aspectRatio}]` : ''} ${className || ''}`}>
        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse transition-colors duration-300 ease-in-out" />
      </div>
    );
  }
  
  const isDarkMode = resolvedTheme === 'dark';
  
  // Define strategy-specific styles
  const strategyStyles = {
    subtle: isDarkMode ? {
      filter: 'brightness(0.92) contrast(0.92) saturate(0.95)',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
      borderRadius: 'inherit',
      transition: 'filter 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
    } : {
      transition: 'filter 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
    },
    
    invert: isDarkMode ? {
      filter: 'invert(0.9) hue-rotate(180deg)',
      borderRadius: 'inherit',
      transition: 'filter 0.3s ease',
    } : {
      transition: 'filter 0.3s ease',
    },
    
    dim: isDarkMode ? {
      filter: 'brightness(0.7) contrast(0.85) saturate(0.85)',
      borderRadius: 'inherit',
      transition: 'filter 0.3s ease',
    } : {
      transition: 'filter 0.3s ease',
    },
    
    frame: isDarkMode ? {
      border: '8px solid rgba(30, 30, 30, 0.8)',
      borderRadius: 'inherit',
      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
      transition: 'border 0.3s ease, box-shadow 0.3s ease',
    } : {
      transition: 'border 0.3s ease, box-shadow 0.3s ease',
    },
    
    vignette: {
      transition: 'all 0.3s ease',
    },
    
    blend: isDarkMode ? {
      mixBlendMode: 'difference',
      borderRadius: 'inherit',
      transition: 'mix-blend-mode 0.3s ease',
    } : {
      transition: 'mix-blend-mode 0.3s ease',
    },
    
    // For images that are natively designed for dark mode
    // Inverts them in light mode, leaves them untouched in dark mode
    'counter-invert': isDarkMode ? {
      // Leave dark mode images as-is since they're designed for dark themes
      transition: 'filter 0.3s ease',
    } : {
      // Clean inversion without color shifts for seamless background matching
      filter: 'invert(1) brightness(1.02) contrast(0.98)',
      borderRadius: 'inherit',
      transition: 'filter 0.3s ease',
    },
    
    none: {
      transition: 'all 0.3s ease',
    },
  };
  
  // Get the active style for the current strategy
  const activeStyles = strategyStyles[strategy] || { transition: 'all 0.3s ease' };
  
  // Create the image container class
  const containerClass = `
    relative 
    ${aspectRatio ? `aspect-[${aspectRatio}]` : ''} 
    ${className || ''}
    ${strategy === 'vignette' && isDarkMode ? 'img-vignette' : ''}
    transition-all duration-300 ease-in-out
  `;
  
  // Define image component props
  const imageProps = {
    src,
    alt,
    onLoad: handleImageLoad,
    style: {
      ...activeStyles,
      objectFit,
      width: '100%',
      height: aspectRatio ? 'auto' : 'auto',
      ...customStyles,
    },
    className: `${strategy === 'frame' ? 'rounded-lg' : 'rounded-inherit'} transition-all duration-300 ease-in-out`,
    ...nextProps,
  };
  
  return (
    <div className={containerClass}>
      {width && height ? (
        <Image
          width={width}
          height={height}
          {...imageProps}
          priority={priority}
        />
      ) : (
        <img
          {...imageProps}
          className={`w-full ${imageProps.className}`}
        />
      )}
      
      {(showCaption && caption) && (
        <div className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400 italic font-serif transition-colors duration-300 ease-in-out">
          {caption}
        </div>
      )}
    </div>
  );
}

/*
Usage examples:

// For images with light backgrounds (most common)
<ImageThemeAdjuster
  src="/path/to/image.jpg"
  alt="Description"
  strategy="subtle"
  aspectRatio="16/9"
  className="w-full my-4"
  showCaption={true}
  caption="This is an image with a light background"
/>

// For images that are natively designed for dark mode
<ImageThemeAdjuster
  src="/path/to/dark-mode-image.jpg"
  alt="Description"
  strategy="counter-invert"
  aspectRatio="16/9"
  className="w-full my-4"
  showCaption={true}
  caption="This image is designed for dark mode"
/>
*/ 