"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * A component that wraps images with light backgrounds to make them
 * more visually appealing in dark mode by adding soft edges and a subtle container.
 * 
 * Theme transitions are handled by the global CSS transition rule.
 * This component only applies static dark-mode styling via CSS classes.
 */
export function DarkModeImageWrapper({
  src,
  alt,
  className = "",
  rounded = "rounded-lg",
  softEdge = true,
  borderStyle = "border border-neutral-200/30 dark:border-neutral-700/30",
  containerStyle = "bg-neutral-100/30 dark:bg-neutral-800/30",
  isCoverImage = false,
}) {
  // Container classes - no transition-all, rely on global theme transitions
  const containerClasses = cn(
    "relative overflow-hidden",
    rounded,
    borderStyle,
    containerStyle,
    isCoverImage ? "backdrop-blur-[2px] p-1" : "p-0.5"
  );

  // Image classes - use dark-mode-image class which has proper CSS transitions defined
  const imageClasses = cn(
    "w-full h-auto",
    rounded,
    softEdge && "dark:dark-mode-image"
  );

  const renderImage = () => {
    if (typeof src === 'string') {
      return (
        <img
          src={src}
          alt={alt}
          className={imageClasses}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        className={imageClasses}
      />
    );
  };

  return (
    <div className={containerClasses}>
      <div className={cn("relative", className)}>
        {renderImage()}
      </div>
    </div>
  );
}