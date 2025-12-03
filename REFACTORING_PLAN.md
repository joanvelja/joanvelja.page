# Refactoring & Upgrade Plan

This document outlines the strategy to modernize the codebase, update dependencies to their latest stable versions, and eliminate "AI slop" and technical debt, adhering to the new `AGENTS.md` guidelines.

## 1. Dependency Upgrades

**Goal:** Bring the project to the cutting edge while ensuring stability.

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `next` | 15.1.7 | 16.0.x | Major upgrade. Verify Turbopack stability. |
| `react` | 19.0.0 | 19.2.x | Minor update, likely safe. |
| `react-dom` | 19.0.0 | 19.2.x | Match React version. |
| `tailwindcss`| 3.4.17 | 4.1.x | **MAJOR**. Breaking changes in config. |
| `lucide-react`| 0.475.0 | 0.555.x | Icon updates. |
| `framer-motion`| 12.4.2 | 12.23.x | Animation library update. |

**Action Items:**
- [ ] Run `npm install next@latest react@latest react-dom@latest tailwindcss@latest postcss@latest autoprefixer@latest`.
- [ ] Update `next.config.mjs` if needed for Next.js 16.
- [ ] Migrate Tailwind 3 config (`tailwind.config.mjs`) to Tailwind 4 (CSS-first configuration).

## 2. Codebase Hygiene & "Slop" Removal

**Goal:** Enforce strict, minimalistic, and readable code.

### A. Component Cleanup (`src/components`)
- [ ] **Extension Standardization**: Rename all `.js` files in `src/components` to `.jsx` for consistency.
- [ ] **`Sidenote` / `FloatingNote`**: `Sidenote.js` just re-exports `FloatingNote`.
  - *Action*: Rename `FloatingNote.js` to `Sidenote.jsx` and remove the wrapper. Update imports.
- [ ] **`MarginNote`**: Currently uses `document.getElementById` and `setTimeout`.
  - *Action*: Refactor to use `useRef` and React state properly. Remove direct DOM manipulation.
- [ ] **`ImageThemeAdjuster`**: Contains excessive comments, complex strategies, and inline styles.
  - *Action*: Simplify to core functionality. Remove "slop" comments. Use Tailwind classes via `cn()` instead of inline `style` objects where possible.
- [ ] **`MDXComponents`**:
  - *Action*: Remove defensive checks (e.g., `if (!props.src || ...) return null`).

### B. Directory Structure (`AGENTS.md` Compliance)
- [ ] **Create `src/hooks`**:
  - Move custom hooks (e.g., if `MarginNotes.js` contains hook logic) into this directory.
  - Ensure `useTheme` usage is consistent.
- [ ] **Component Organization**:
  - Group components: `src/components/ui`, `src/components/mdx`, `src/components/layout`.

## 3. Functional Preservation & Testing

**Goal:** Ensure the website looks and behaves the same after heavy refactoring.

- **Visual Regression**: Since we are upgrading Tailwind, this is critical.
- **Test Plan**:
  - Verify the build: `npm run build`.
  - Verify the blog posts render correctly (MDX).
  - Verify dark mode toggling (critical for `ImageThemeAdjuster`).

## 4. Execution Order

1.  **Cleanup First**: Rename files, remove unused code/slop *before* upgrading dependencies to isolate issues.
2.  **Refactor Components**: Fix `MarginNote`, `Sidenote`, etc.
3.  **Upgrade Dependencies**: Bump versions one group at a time (React/Next first, then Tailwind).
4.  **Verify**: Run build and local dev server.
