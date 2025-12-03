# AGENTS.md — Next.js + React house rules

This repo is optimized for fast, reproducible web development with Next.js. Defaults are opinionated: **npm**, **ESLint**, **Jest**, **Tailwind CSS**, component-driven architecture, and strict separation of concerns.

---

## Tooling & workflow
- Use **npm** for everything.
- Env & deps:
  - Add deps: `npm install <pkg>` (save to `dependencies`) or `npm install -D <pkg>` (for `devDependencies`).
  - Run: `npm run <script>` (e.g., `npm run dev`, `npm test`).
  - One-off tools: `npx <tool>` (e.g., `npx eslint .`).
- When the agent needs to install or run anything, prefer the `npm` commands above.
- Keep `package-lock.json` committed for deterministic installs.

> Notes:
> - `package-lock.json` is the source of truth for dependency versions.

---

## Coding conventions
- **React 19+ / Next.js 15+**: Functional components, Hooks, Server Components by default (add `'use client'` only when necessary).
- **Styling**: **Tailwind CSS** for all styling. Avoid CSS modules or inline styles unless dynamic. Use `cn()` utility for class merging.
- **Linting/Formatting**: Follow `eslint` config. Run `npm run lint` to verify.
- **State Management**: React Context for global state, Hooks for local logic. Avoid external state libraries (Redux/Zustand) unless complexity demands it.
- **Comments**: JSDoc for complex functions.
- **File Structure**:
  - `src/app`: Routes and pages (Next.js App Router).
  - `src/components`: Reusable UI components.
  - `src/hooks`: Custom React hooks.
  - `src/lib`: Business logic, utilities, API clients (no UI code).

---

## Project hygiene
- Always ensure `node_modules` is up to date (`npm install`).
- Pre-commit hooks are configured with Husky.
- Before opening a PR/committing:
  `npm run lint && npm test` (if tests are set up).

---

## Implementation Guidelines

### 1) Architecture & Abstractions (Composition + Hooks)

* **Component Composition**: Build complex UIs from small, atomic components. Pass data via props. Use `children` for flexibility.
* **Separation of Concerns**:
  * **UI Components**: Pure presentation. Receive data, render UI, trigger callbacks.
  * **Custom Hooks**: Encapsulate logic, state, and side effects. Return data and handlers.
  * **Utils/Lib**: Pure functions, helpers, API calls.
* **Client vs. Server**: default to Server Components for data fetching/rendering. Use Client Components (`'use client'`) only for interactivity (state, effects, event listeners).

```jsx
// components/UserProfile.jsx
'use client';
import { useUser } from '@/hooks/useUser';

export function UserProfile({ userId }) {
  const { user, isLoading, error } = useUser(userId); // Logic hidden in hook

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMsg error={error} />;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
}
```

### 2) Configuration & Constants

* **Environment Variables**: Use `.env.local` for secrets and config. Access via `process.env`.
* **Constants**: Store static data/config in `src/lib/constants.js` or similar.
* **Theming**: Use `tailwind.config.mjs` for design tokens (colors, fonts, spacing).

### 3) Testing strategy

* **Unit tests**: `jest` + `react-testing-library`. Test behaviors, not implementation details.
* **Snapshot tests**: Use sparingly for complex UI structures.
* **Integration tests**: Test critical flows (e.g., form submission, navigation).

```jsx
// __tests__/UserProfile.test.jsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from '@/components/UserProfile';

test('renders user name', async () => {
  render(<UserProfile userId="123" />);
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

### 4) Documentation & Accessibility

* **Accessibility First**: Semantic HTML (`<button>`, `<nav>`, `<main>`), ARIA labels where needed. Ensure keyboard navigability.
* **Self-documenting code**: Clear variable/function names.

### 5) Extensibility

* **Props Interface**: Define clear prop types (using JSDoc or PropTypes if not TS).
* **Polymorphic Components**: Allow components to render as different elements (e.g., `as="a"` or `as="button"`) where appropriate.

### 6) Tools at your disposal

For every uncertainty, note that you have `web_fetch(query)` at your disposal to run web searches. This is particularly encouraged for dependencies, and how new versions of packages like `next`, `react`, and `tailwindcss` implement features as they update. It is of paramount importance that we stay on top of our game here: these are libraries in constant evolution and we do not want to fall behind in terms of (new) functionalities.

# Remove AI code slop

Check the diff against main, and remove all AI generated slop introduced in this branch.

This includes:
- Extra comments that a human wouldn't add or is inconsistent with the rest of the file
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted / validated codepaths)
- Casts to any to get around type issues
- Any other style that is inconsistent with the file

Report at the end with only a 1-3 sentence summary of what you changed
