'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * InteractiveEmbed - A component for embedding interactive HTML content
 * 
 * This component creates an iframe to display interactive content like
 * visualizations, demos, or any standalone HTML files.
 */
export function InteractiveEmbed({
  src,
  title = "Interactive Content",
  height = "500px",
  width = "100%",
  className = "",
  showTitle = false,
  allowFullscreen = true,
  sandbox = "allow-scripts allow-same-origin allow-popups allow-forms",
  loading = "lazy",
  showCaption = false,
  caption = "",
  aspectRatio, // e.g., "16/9", "4/3", "1/1"
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Show loading placeholder during SSR
  if (!mounted) {
    return (
      <div className={`my-8 ${className}`}>
        {showTitle && (
          <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white font-serif">
            {title}
          </h3>
        )}
        <div 
          className={`
            relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700
            bg-neutral-50 dark:bg-neutral-800
            ${aspectRatio ? `aspect-[${aspectRatio}]` : ''}
          `}
          style={!aspectRatio ? { height } : {}}
        >
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-neutral-500 dark:text-neutral-400 font-serif">
              Loading interactive content...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className={`my-8 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white font-serif">
          {title}
        </h3>
      )}
      
      <div 
        className={`
          relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700
          bg-white dark:bg-neutral-900 shadow-sm transition-all duration-300 ease-in-out
          ${aspectRatio ? `aspect-[${aspectRatio}]` : ''}
          ${isDarkMode ? 'shadow-neutral-900/20' : 'shadow-neutral-300/20'}
        `}
        style={!aspectRatio ? { height } : {}}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-neutral-300 dark:border-neutral-600 border-t-blue-500 rounded-full"></div>
              <span className="text-neutral-600 dark:text-neutral-400 font-serif text-sm">
                Loading {title.toLowerCase()}...
              </span>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
            <div className="text-center p-4">
              <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
              <div className="text-neutral-600 dark:text-neutral-400 font-serif text-sm">
                Failed to load interactive content
              </div>
              <button 
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  // Force iframe reload by changing src
                  const iframe = document.querySelector(`iframe[title="${title}"]`);
                  if (iframe) {
                    iframe.src = iframe.src;
                  }
                }}
                className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* The actual iframe */}
        <iframe
          src={src}
          title={title}
          width={width}
          height={aspectRatio ? "100%" : height}
          className="w-full h-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          sandbox={sandbox}
          loading={loading}
          allow={allowFullscreen ? "fullscreen" : ""}
          allowFullScreen={allowFullscreen}
        />
      </div>

      {/* Caption */}
      {showCaption && caption && (
        <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-2 italic font-serif">
          {caption}
        </p>
      )}
    </div>
  );
}

/*
Usage examples:

// Basic usage
<InteractiveEmbed 
  src="/images/blog/dimensions/high_dim_interactive.html"
  title="High Dimensional Visualization"
/>

// With aspect ratio and caption
<InteractiveEmbed 
  src="/images/blog/dimensions/high_dim_interactive.html"
  title="High Dimensional Landscape"
  aspectRatio="16/9"
  showCaption={true}
  caption="Interactive visualization of high-dimensional loss landscapes"
/>

// With custom height
<InteractiveEmbed 
  src="/path/to/interactive.html"
  title="Custom Visualization"
  height="600px"
  showTitle={true}
/>
*/ 