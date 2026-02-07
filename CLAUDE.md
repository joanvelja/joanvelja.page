# CLAUDE.md — joanvelja.page

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

---

## Commands

```bash
bun dev         # Development server with Turbopack
bun run build   # Production build
bun test        # Jest tests
bun run lint    # ESLint
```

---

## Reasoning & Planning Framework

**You are a very strong reasoner and planner.** Before taking any action (tool calls, code changes, or responses to the user), you must proactively, methodically, and independently plan and reason about:

### 1) Logical dependencies and constraints
Analyze the intended action against the following factors. Resolve conflicts in order of importance:
- **1.1) Policy-based rules, mandatory prerequisites, and constraints** (from this document and project requirements)
- **1.2) Order of operations**: Ensure taking an action does not prevent a subsequent necessary action
  - **1.2.1)** The user may request actions in a random order, but you may need to reorder operations to maximize successful completion of the task
- **1.3) Other prerequisites**: Information and/or actions needed before proceeding
- **1.4) Explicit user constraints or preferences**

### 2) Risk assessment
What are the consequences of taking the action? Will the new state cause any future issues?
- **2.1)** For exploratory tasks (like searches, dependency checks), missing *optional* parameters is a LOW risk. **Prefer calling the tool with the available information over asking the user, unless** your `Rule 1` (Logical Dependencies) reasoning determines that optional information is required for a later step in your plan.

### 3) Abductive reasoning and hypothesis exploration
At each step, identify the most logical and likely reason for any problem encountered.
- **3.1)** Look beyond immediate or obvious causes. The most likely reason may not be the simplest and may require deeper inference.
- **3.2)** Hypotheses may require additional research. Each hypothesis may take multiple steps to test.
- **3.3)** Prioritize hypotheses based on likelihood, but do not discard less likely ones prematurely. A low-probability event may still be the root cause.

### 4) Outcome evaluation and adaptability
Does the previous observation require any changes to your plan?
- **4.1)** If your initial hypotheses are disproven, actively generate new ones based on the gathered information.

### 5) Information availability
Incorporate all applicable and alternative sources of information, including:
- **5.1)** Using available tools and their capabilities (especially `web_fetch` for dependency/API updates)
- **5.2)** All policies, rules, checklists, and constraints (this document)
- **5.3)** Previous observations and conversation history
- **5.4)** Information only available by asking the user

### 6) Precision and Grounding
Ensure your reasoning is extremely precise and relevant to each exact ongoing situation.
- **6.1)** Verify your claims by quoting the exact applicable information (including policies) when referring to them.

### 7) Completeness
Ensure that all requirements, constraints, options, and preferences are exhaustively incorporated into your plan.
- **7.1)** Resolve conflicts using the order of importance in #1
- **7.2)** Avoid premature conclusions: There may be multiple relevant options for a given situation
  - **7.2.1)** To check for whether an option is relevant, reason about all information sources from #5
  - **7.2.2)** You may need to consult the user to even know whether something is applicable. Do not assume it is not applicable without checking.
- **7.3)** Review applicable sources of information from #5 to confirm which are relevant to the current state

### 8) Persistence and patience
Do not give up unless all the reasoning above is exhausted.
- **8.1)** Don't be dissuaded by time taken or user frustration
- **8.2)** This persistence must be intelligent: On *transient* errors (e.g. "please try again"), you *must* retry **unless an explicit retry limit (e.g., max x tries) has been reached**. If such a limit is hit, you *must* stop. On *other* errors, you must change your strategy or arguments, not repeat the same failed call.

### 9) Inhibit your response
Only take an action after all the above reasoning is completed. Once you've taken an action, you cannot take it back.

---

## Tooling & Workflow

- Use **bun** for everything.
- Env & deps:
  - Add deps: `bun add <pkg>` (save to `dependencies`) or `bun add -d <pkg>` (for `devDependencies`).
  - Run: `bun run <script>` (e.g., `bun dev`, `bun test`).
  - One-off tools: `bunx <tool>` (e.g., `bunx eslint .`).
- Keep `bun.lock` committed for deterministic installs.

> `bun.lock` is the source of truth for dependency versions.

---

## Coding Conventions

- **React 19+ / Next.js 15+**: Functional components, Hooks, Server Components by default (add `'use client'` only when necessary).
- **Styling**: **Tailwind CSS** for all styling. Avoid CSS modules or inline styles unless dynamic. Use `cn()` utility for class merging.
- **Linting/Formatting**: Follow `eslint` config. Run `bun run lint` to verify.
- **State Management**: React Context for global state, Hooks for local logic. Avoid external state libraries (Redux/Zustand) unless complexity demands it.
- **Comments**: JSDoc for complex functions.
- **File Structure**:
  - `src/app`: Routes and pages (Next.js App Router).
  - `src/components`: Reusable UI components.
  - `src/hooks`: Custom React hooks.
  - `src/lib`: Business logic, utilities, API clients (no UI code).

---

## Implementation Guidelines

### 1) Architecture & Abstractions (Composition + Hooks)

* **Component Composition**: Build complex UIs from small, atomic components. Pass data via props. Use `children` for flexibility.
* **Separation of Concerns**:
  * **UI Components**: Pure presentation. Receive data, render UI, trigger callbacks.
  * **Custom Hooks**: Encapsulate logic, state, and side effects. Return data and handlers.
  * **Utils/Lib**: Pure functions, helpers, API calls.
* **Client vs. Server**: Default to Server Components for data fetching/rendering. Use Client Components (`'use client'`) only for interactivity (state, effects, event listeners).

### 2) Configuration & Constants

* **Environment Variables**: Use `.env.local` for secrets and config. Access via `process.env`.
* **Constants**: Store static data/config in `src/lib/constants.js` or similar.
* **Theming**: Use `tailwind.config.mjs` for design tokens (colors, fonts, spacing).

### 3) Testing Strategy

* **Unit tests**: `jest` + `react-testing-library`. Test behaviors, not implementation details.
* **Snapshot tests**: Use sparingly for complex UI structures.
* **Integration tests**: Test critical flows (e.g., form submission, navigation).

### 4) Documentation & Accessibility

* **Accessibility First**: Semantic HTML (`<button>`, `<nav>`, `<main>`), ARIA labels where needed. Ensure keyboard navigability.
* **Self-documenting code**: Clear variable/function names.

### 5) Extensibility

* **Props Interface**: Define clear prop types (using JSDoc or PropTypes if not TS).
* **Polymorphic Components**: Allow components to render as different elements (e.g., `as="a"` or `as="button"`) where appropriate.

### 6) Tools at Your Disposal

For every uncertainty, note that you have `web_fetch(query)` at your disposal to run web searches. This is particularly encouraged for dependencies, and how new versions of packages like `next`, `react`, and `tailwindcss` implement features as they update. Stay on top of library evolution.

---

## AI Code Slop Removal

Check the diff against main, and remove all AI generated slop introduced in this branch.

This includes:
- Extra comments that a human wouldn't add or is inconsistent with the rest of the file
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted / validated codepaths)
- Casts to any to get around type issues
- Any other style that is inconsistent with the file

Report at the end with only a 1-3 sentence summary of what you changed.

---

## Project-Specific Architecture

### App Router Structure

The site uses Next.js App Router with route groups:

```
src/app/
├── (main)/           # Main site layout wrapper
│   ├── about/
│   ├── blog/
│   │   ├── [slug]/   # Dynamic blog post routes
│   │   └── components/
│   ├── contact/
│   ├── photos/
│   └── projects/
├── api/              # API routes
├── layout.js         # Root layout
└── page.js           # Home page
```

### MDX Content Pipeline

Blog posts live in `content/blog/*.mdx` with frontmatter:

```yaml
---
title: Post Title
description: Brief description
image: /images/blog/cover.png
date: '2025-01-15'
tags:
  - Tag1
  - Tag2
isProtected: false  # Optional: password-protected posts
---
```

Processing: `gray-matter` for frontmatter → `next-mdx-remote/rsc` for compilation → custom components via `src/lib/mdx-components.js`.

### Server vs Client Components

- **Server by default**: Pages, layouts, data fetching
- **Client (`'use client'`)**: Interactive components (Sidenote, Citation, MarginNote, TableOfContents, FluidCanvas)

### Key Custom Features

- **Citations**: Academic-style numbered references with tooltips and auto-generated bibliography
- **Sidenotes**: Hover-reveal footnotes with popup positioning
- **MarginNotes**: Side-margin annotations for supplementary content
- **ImageThemeAdjuster**: Dark mode image handling with invert/adaptive strategies
- **FluidCanvas**: WebGL fluid simulation background
- **Password Protection**: Encrypted content with client-side decryption

---

## MDX Content Guidelines

### Available Components

Use these directly in MDX files:

```jsx
// Citations - academic references
<Citation
  author="Author Name"
  year="2024"
  title="Paper Title"
  url="https://..."
  venue="Conference/Journal"
/>

// Auto-generated bibliography at end
<Bibliography />

// Sidenotes - hover-reveal footnotes
<Sidenote>Additional context that appears on hover</Sidenote>

// Margin notes - labeled side annotations
<MarginNote label="Note">Content appears in margin on wide screens</MarginNote>

// Image with dark mode handling
<ImageThemeAdjuster
  src="/images/blog/image.png"
  alt="Description"
  strategy="invert"  // or "adaptive", "none"
  aspectRatio="16/9"
  showCaption={true}
  caption="Source attribution"
/>

// Interactive embeds
<InteractiveEmbed src="https://..." height={400} />
```

### Math Support

LaTeX via `$$...$$` for display math or `$...$` for inline.

### Code Blocks

Standard markdown fenced code blocks with syntax highlighting.

---

## Project Hygiene

- Always ensure `node_modules` is up to date (`bun install`).
- Pre-commit hooks are configured with Husky.
- Before opening a PR/committing: `bun run lint && bun test`
