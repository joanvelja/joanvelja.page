# Code Refactoring: Removing Bloat

This document summarizes the changes made to remove code bloat and reduce redundancies.

## 1. Created Centralized Utilities

- Created `src/utils/mdx.js` with shared MDX utilities:
  - `slugify()` function for URL-friendly headings
  - `renderTextWithLinks()` for markdown links in text

- Created `src/utils/reading.js` with text analysis utilities:
  - `estimateReadingTime()` for calculating reading time

## 2. Unified Image Components

- Created `src/components/ImageHandler.jsx`:
  - A unified component that replaces both `DarkModeImageWrapper` and `ImageThemeAdjuster`
  - Added backward-compatible wrapper functions
  - Supports multiple rendering strategies for dark mode
  
## 3. Centralized MDX Components

- Created `src/components/mdx/index.js`:
  - Single source of truth for all MDX component styling
  - Consistent styling across the application
  - Named exports for flexibility

## 4. Extracted Theme Toggle

- Created `src/components/ThemeToggle.jsx`:
  - Extracted theme toggle functionality from layout
  - Made it reusable across the site

## 5. Updated Components to Use Centralized Code

- Updated `/blog/[slug]/page.js` to use centralized MDX components
- Updated `ProtectedContent.jsx` to use centralized components
- Updated `about/page.js` to use shared utilities
- Modified `layout.js` to use the ThemeToggle component

## 6. Removed Redundant Files

- Removed duplicated utility functions
- Deleted redundant component files:
  - `DarkModeImageWrapper.jsx`
  - `ImageThemeAdjuster.jsx`
  - `MDXComponents.jsx`

## Benefits

1. **Reduced Code Size**: Eliminated hundreds of lines of duplicated code
2. **Improved Maintainability**: Changes to styling/behavior only need to be made in one place
3. **Consistent Styling**: Ensured consistent design across all parts of the application
4. **Better Organization**: Clearer separation of concerns in the codebase
5. **Simplified Components**: Made individual components more focused and easier to understand 