# Refactoring Priorities - Phase 2

This document outlines the priorities for Phase 2 of the refactoring process, focusing on core utilities and foundations.

## Shared Hooks Extraction

### Priority 1: Theme Handling

Extract and standardize theme handling across components.

```jsx
// src/hooks/use-theme.js
'use client';

import { useState, useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  
  // Ensure we only access theme client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Enhanced functionality over the basic useTheme
  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');
  const isLight = mounted && (resolvedTheme === 'light' || theme === 'light');
  
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  return {
    theme: mounted ? theme : undefined,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
    mounted,
  };
}
```

Replace usage in components:
- `ThemeToggle.jsx`
- `ImageHandler.jsx`
- Any other components using theme detection

### Priority 2: Intersection Observer

Create a reusable hook for intersection observer functionality.

```jsx
// src/hooks/use-intersection-observer.js
'use client';

import { useState, useEffect, useRef } from 'react';

export function useIntersectionObserver({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  enabled = true,
} = {}) {
  const [entry, setEntry] = useState(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  
  useEffect(() => {
    if (!enabled) {
      return;
    }
    
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);
      },
      { root, rootMargin, threshold }
    );
    
    // Observe element
    const element = elementRef.current;
    if (element) {
      observerRef.current.observe(element);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, root, rootMargin, threshold]);
  
  return {
    ref: elementRef,
    entry,
    isIntersecting,
    observer: observerRef.current,
  };
}
```

Replace usage in components:
- `SectionObserver.js`
- `MarginNotes.js`

### Priority 3: Element Position

Create a hook for calculating element positions.

```jsx
// src/hooks/use-element-position.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useElementPosition(ref) {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  
  const updatePosition = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
      });
    }
  }, [ref]);
  
  useEffect(() => {
    updatePosition();
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);
  
  return position;
}
```

Replace usage in components:
- `MarginNotes.js`
- `FloatingNote.js`

### Priority 4: Unique ID Generation

Create a hook for generating unique IDs.

```jsx
// src/hooks/use-id.js
'use client';

import { useState } from 'react';

let globalId = 0;

export function useId(prefix = 'id') {
  const [id] = useState(() => `${prefix}-${++globalId}`);
  return id;
}
```

Replace usage in components:
- Note components
- Form components

## Utility Functions Extraction

### Priority 1: Class Name Merging

Create a utility for merging class names.

```jsx
// src/utils/cn.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Priority 2: MDX Utilities

Standardize MDX utility functions.

```jsx
// src/utils/mdx.js
export function slugify(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start of text
    .replace(/-+$/, '');          // Trim - from end of text
}

export function estimateReadingTime(text) {
  if (!text) return 0;
  
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function extractHeadings(content) {
  if (!content) return [];
  
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({
      level,
      text,
      id: slugify(text),
    });
  }
  
  return headings;
}
```

### Priority 3: DOM Utilities

Create helpers for common DOM operations.

```jsx
// src/utils/dom.js
export function getScrollPosition() {
  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset,
  };
}

export function scrollToElement(selector, options = {}) {
  const element = 
    typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;
      
  if (!element) return;
  
  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
  };
  
  element.scrollIntoView({
    ...defaultOptions,
    ...options,
  });
}

export function isElementInViewport(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
```

## Component Foundation System

### Priority 1: Typography Components

Create base typography components.

```jsx
// src/components/ui/typography.jsx
import { cn } from '@/utils/cn';

export function Heading({
  level = 2,
  children,
  className,
  ...props
}) {
  const Tag = `h${level}`;
  
  const styles = {
    1: 'text-3xl font-bold mt-8 mb-4',
    2: 'text-2xl font-bold mt-8 mb-4',
    3: 'text-xl font-bold mt-6 mb-3',
    4: 'text-lg font-bold mt-6 mb-3',
    5: 'text-base font-bold mt-4 mb-2',
    6: 'text-sm font-bold mt-4 mb-2',
  };
  
  return (
    <Tag
      className={cn(
        styles[level] || styles[2],
        'text-neutral-900 dark:text-white font-serif',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Paragraph({
  children,
  className,
  ...props
}) {
  return (
    <p
      className={cn(
        'mb-6 text-neutral-700 dark:text-neutral-300 leading-[1.8] tracking-[0.01em] text-[1.05rem] font-serif',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Link({
  href,
  children,
  className,
  ...props
}) {
  return (
    <a
      href={href}
      className={cn(
        'text-blue-500 hover:underline',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

// Continue with other typography components
```

### Priority 2: Container Components

Create base container components.

```jsx
// src/components/ui/container.jsx
import { cn } from '@/utils/cn';

export function Container({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700',
        'p-4 sm:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

## Notes System Foundation

Create a unified foundation for all note types.

```jsx
// src/components/notes/context.jsx
'use client';

import { createContext, useContext, useState } from 'react';

export const NotesContext = createContext(null);

export function NotesProvider({
  children,
  displayMode = 'side', // 'side', 'margin', 'inline'
}) {
  const [notes, setNotes] = useState([]);
  const [visibleNotes, setVisibleNotes] = useState([]);
  
  const registerNote = (note) => {
    setNotes(prev => {
      if (prev.some(n => n.id === note.id)) {
        return prev;
      }
      return [...prev, note];
    });
  };
  
  const showNote = (id) => {
    setVisibleNotes(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };
  
  const hideNote = (id) => {
    setVisibleNotes(prev => prev.filter(noteId => noteId !== id));
  };
  
  const value = {
    notes,
    visibleNotes,
    registerNote,
    showNote,
    hideNote,
    displayMode,
  };
  
  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  
  return context;
}
```

## Implementation Plan

1. Create the shared hooks directory and implement hooks in priority order
2. Create the utility functions in priority order
3. Update components to use the new hooks and utilities
4. Create the UI component foundation
5. Implement the unified notes system

## Testing Approach

Each extracted hook and utility should have corresponding tests:

```jsx
// src/hooks/use-theme.test.js
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './use-theme';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
  }),
}));

describe('useTheme', () => {
  it('should initialize with correct values', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.mounted).toBe(false);
    expect(result.current.theme).toBeUndefined();
  });
  
  it('should update mounted state after effect runs', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      // Trigger useEffect
      jest.runAllTimers();
    });
    
    expect(result.current.mounted).toBe(true);
    expect(result.current.theme).toBe('light');
  });
});
``` 