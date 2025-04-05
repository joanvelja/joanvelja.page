# Style Guide for Refactoring

This document defines the design system and component patterns to be implemented during refactoring.

## Design Tokens

### Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-text-primary` | `#171717` (neutral-900) | `#FFFFFF` (white) | Headings, important text |
| `--color-text-secondary` | `#404040` (neutral-700) | `#D4D4D4` (neutral-300) | Body text |
| `--color-text-tertiary` | `#525252` (neutral-600) | `#A3A3A3` (neutral-400) | Less important text |
| `--color-text-accent` | `#3B82F6` (blue-500) | `#60A5FA` (blue-400) | Links, buttons |
| `--color-bg-primary` | `#FFFFFF` (white) | `#171717` (neutral-900) | Main background |
| `--color-bg-secondary` | `#F5F5F5` (neutral-100) | `#262626` (neutral-800) | Card backgrounds |
| `--color-bg-tertiary` | `#FAFAFA` (neutral-50) | `#404040` (neutral-700) | Subtle backgrounds |
| `--color-border-default` | `#E5E5E5` (neutral-200) | `#525252` (neutral-600) | Borders, dividers |
| `--color-border-light` | `#F5F5F5` (neutral-100) | `#404040` (neutral-700) | Subtle borders |

### Typography

| Token | Properties | Usage |
|-------|------------|-------|
| `--font-heading` | Font family: serif | All headings |
| `--font-body` | Font family: serif | Body text |
| `--font-ui` | Font family: sans-serif | UI elements, buttons |
| `--font-code` | Font family: monospace | Code snippets |

| Token | Size | Line Height | Tracking | Usage |
|-------|------|-------------|----------|-------|
| `--text-xxl` | 1.875rem (30px) | 1.2 | -0.02em | Heading 1 |
| `--text-xl` | 1.5rem (24px) | 1.2 | -0.01em | Heading 2 |
| `--text-lg` | 1.25rem (20px) | 1.3 | -0.01em | Heading 3 |
| `--text-md` | 1.125rem (18px) | 1.4 | 0 | Heading 4 |
| `--text-base` | 1.05rem (16.8px) | 1.8 | 0.01em | Body text |
| `--text-sm` | 0.875rem (14px) | 1.5 | 0.01em | Small text, captions |
| `--text-xs` | 0.75rem (12px) | 1.5 | 0.02em | Very small text |

### Spacing

| Token | Size | Usage |
|-------|------|-------|
| `--space-xxs` | 0.25rem (4px) | Minimal spacing |
| `--space-xs` | 0.5rem (8px) | Tight spacing |
| `--space-sm` | 0.75rem (12px) | Default inner spacing |
| `--space-md` | 1rem (16px) | Standard spacing |
| `--space-lg` | 1.5rem (24px) | Generous spacing |
| `--space-xl` | 2rem (32px) | Section spacing |
| `--space-xxl` | 3rem (48px) | Large section spacing |

### Borders & Radiuses

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.25rem (4px) | Small elements |
| `--radius-md` | 0.375rem (6px) | Buttons, form elements |
| `--radius-lg` | 0.5rem (8px) | Cards, images |
| `--border-thin` | 1px | Fine borders |
| `--border-normal` | 2px | Standard borders |
| `--border-thick` | 4px | Emphasis borders |

## Component Patterns

### Common Component Structure

```jsx
'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/utils/cn';

export function Component({ 
  // Required props
  children,
  
  // Optional props with defaults
  variant = 'default',
  size = 'md',
  className,
  
  // Rest props
  ...props 
}) {
  // Component logic
  
  // Combine classes
  const componentClasses = cn(
    'base-component-class',
    {
      'variant-class': variant === 'default',
      'alt-variant-class': variant === 'alternative',
    },
    {
      'size-md-class': size === 'md',
      'size-lg-class': size === 'lg',
    },
    className
  );
  
  return (
    <div className={componentClasses} {...props}>
      {children}
    </div>
  );
}
```

### Common Hook Pattern

```js
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCustomHook(initialValue, options = {}) {
  // State and refs
  const [state, setState] = useState(initialValue);
  
  // Memoized functions
  const handleChange = useCallback((newValue) => {
    // Implementation
  }, [/* dependencies */]);
  
  // Side effects
  useEffect(() => {
    // Setup
    
    return () => {
      // Cleanup
    };
  }, [/* dependencies */]);
  
  // Return values and functions
  return {
    state,
    handleChange,
  };
}
```

### Context Pattern

```jsx
'use client';

import { createContext, useContext, useState } from 'react';

// Create context with initial value
const ExampleContext = createContext(null);

// Provider component
export function ExampleProvider({ children }) {
  const [state, setState] = useState(initialState);
  
  const value = {
    state,
    updateState: (newState) => setState(newState),
  };
  
  return (
    <ExampleContext.Provider value={value}>
      {children}
    </ExampleContext.Provider>
  );
}

// Custom hook for consuming context
export function useExample() {
  const context = useContext(ExampleContext);
  
  if (!context) {
    throw new Error('useExample must be used within an ExampleProvider');
  }
  
  return context;
}
```

## File Structure Convention

### Component Organization

```
src/
├── components/
│   ├── ui/ (basic UI components)
│   │   ├── button.jsx
│   │   ├── heading.jsx
│   │   └── ...
│   ├── layout/ (layout components)
│   │   ├── container.jsx
│   │   └── ...
│   ├── notes/ (note system components)
│   │   ├── index.js (main exports)
│   │   ├── note-item.jsx
│   │   ├── note-provider.jsx
│   │   └── ...
│   └── mdx/ (MDX rendering components)
│       ├── index.js (main exports)
│       └── ...
├── hooks/ (shared hooks)
│   ├── use-theme.js
│   ├── use-intersection.js
│   └── ...
├── utils/ (utility functions)
│   ├── cn.js (class merging)
│   ├── mdx.js (MDX utilities)
│   └── ...
└── styles/ (global styles)
    ├── globals.css
    └── ...
```

## Coding Conventions

### Naming

- Components: PascalCase (e.g., `Button.jsx`)
- Hooks: camelCase starting with "use" (e.g., `useTheme.js`)
- Utilities: camelCase (e.g., `formatDate.js`)
- CSS classes: kebab-case (e.g., `text-primary`)

### Props

- Use destructuring for props
- Provide default values when appropriate
- Use the spread operator for passing through HTML attributes

### Styling

- Use Tailwind utility classes directly in components
- Use the `cn` utility function to conditionally apply classes
- Extract common patterns to component classes in `globals.css`
- Use CSS variables for theme values

### Performance

- Memoize expensive calculations with `useMemo`
- Memoize callback functions with `useCallback`
- Use the React DevTools Profiler to identify performance issues

## Accessibility Guidelines

- Use semantic HTML elements
- Ensure proper heading hierarchy
- Provide alt text for images
- Use ARIA attributes when necessary
- Ensure keyboard navigation works
- Maintain sufficient color contrast

## Testing Approach

- Write unit tests for utility functions
- Write component tests that focus on behavior, not implementation
- Use React Testing Library for component testing
- Create visual regression tests for UI components 