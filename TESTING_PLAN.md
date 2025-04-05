# Testing Infrastructure Plan

This document outlines the testing infrastructure and approach for the refactoring project.

## Testing Stack

### Core Testing Libraries

- **Jest**: JavaScript testing framework
- **React Testing Library**: For testing React components
- **@testing-library/user-event**: For simulating user interactions
- **@testing-library/jest-dom**: Custom matchers for DOM testing

### Visual Testing

- **Storybook**: For component development and documentation
- **Chromatic**: For visual regression testing (optional)

### End-to-End Testing

- **Playwright**: For critical user flows (optional, future phase)

## Configuration Setup

### Jest Configuration

Create a `jest.config.js` file:

```js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

Create a `jest.setup.js` file:

```js
import '@testing-library/jest-dom';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
  }

  observe(element) {
    this.elements.add(element);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Helper to trigger intersection
  triggerIntersection(entries) {
    this.callback(entries, this);
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
  }),
}));
```

### Storybook Configuration

Create `.storybook/main.js`:

```js
module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    'storybook-addon-next',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: true,
  },
};
```

Create `.storybook/preview.js`:

```js
import '../src/app/globals.css';
import { ThemeProvider } from 'next-themes';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#fff' },
      { name: 'dark', value: '#171717' },
    ],
  },
};

export const decorators = [
  (Story) => (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="p-4">
        <Story />
      </div>
    </ThemeProvider>
  ),
];
```

## Testing Approach by Component Type

### Utility Functions

```jsx
// Example test for a utility function
import { slugify } from '@/utils/mdx';

describe('slugify', () => {
  it('converts text to lowercase with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  
  it('handles special characters', () => {
    expect(slugify('Hello & World!')).toBe('hello-world');
  });
  
  it('returns empty string for null or undefined', () => {
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });
});
```

### UI Components

```jsx
// Example test for a UI component
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button', { name: /click me/i }));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies the correct classes for different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-primary');
  });
});
```

### Custom Hooks

```jsx
// Example test for a custom hook
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/use-counter';

describe('useCounter', () => {
  it('initializes with the provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
  
  it('increments the counter', () => {
    const { result } = renderHook(() => useCounter(0));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('decrements the counter', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
});
```

### Complex Components with Context

```jsx
// Example test for a component that uses context
import { render, screen } from '@testing-library/react';
import { NotesProvider } from '@/components/notes/note-provider';
import { NoteItem } from '@/components/notes/note-item';
import { useNotes } from '@/hooks/use-notes';

// Mock the hook
jest.mock('@/hooks/use-notes', () => ({
  useNotes: jest.fn(),
}));

describe('NoteItem', () => {
  beforeEach(() => {
    useNotes.mockReturnValue({
      notes: [],
      addNote: jest.fn(),
    });
  });
  
  it('renders the note content', () => {
    render(
      <NotesProvider>
        <NoteItem id="test-note">Test content</NoteItem>
      </NotesProvider>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('registers the note when mounted', () => {
    const addNote = jest.fn();
    useNotes.mockReturnValue({
      notes: [],
      addNote,
    });
    
    render(
      <NotesProvider>
        <NoteItem id="test-note">Test content</NoteItem>
      </NotesProvider>
    );
    
    expect(addNote).toHaveBeenCalledWith(expect.objectContaining({
      id: 'test-note',
      content: expect.anything(),
    }));
  });
});
```

## Storybook Examples

### Basic Component Story

```jsx
// Button.stories.jsx
import { Button } from '@/components/ui/button';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    onClick: { action: 'clicked' },
  },
};

const Template = (args) => <Button {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: 'Default Button',
  variant: 'default',
  size: 'md',
};

export const Outline = Template.bind({});
Outline.args = {
  children: 'Outline Button',
  variant: 'outline',
  size: 'md',
};
```

### Complex Component Story

```jsx
// Notes.stories.jsx
import { NotesProvider } from '@/components/notes/note-provider';
import { NoteItem } from '@/components/notes/note-item';

export default {
  title: 'Components/Notes',
  component: NoteItem,
  decorators: [
    (Story) => (
      <NotesProvider>
        <div className="prose max-w-2xl mx-auto">
          <p>This is a paragraph with a <Story /></p>
          <div className="mt-16" id="notes-container" />
        </div>
      </NotesProvider>
    ),
  ],
};

const Template = (args) => <NoteItem {...args} />;

export const BasicNote = Template.bind({});
BasicNote.args = {
  id: 'note-1',
  children: 'This is a simple note',
};

export const RichNote = Template.bind({});
RichNote.args = {
  id: 'note-2',
  children: (
    <>
      <p>This is a note with <strong>rich</strong> content.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </>
  ),
};
```

## Implementation Plan

### Phase 1: Basic Setup

1. Install testing dependencies:
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
   ```

2. Create Jest configuration files

3. Add script to package.json:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage"
   }
   ```

### Phase 2: Core Utilities Testing

1. Write tests for utility functions:
   - `mdx.js`
   - `reading.js`
   - Class utilities

2. Create foundational test helpers

### Phase 3: Component Testing

1. Create test files for UI components
2. Create test files for hooks
3. Create test files for context providers

### Phase 4: Storybook Integration

1. Install Storybook:
   ```bash
   npx sb init
   ```

2. Create stories for UI components
3. Create stories for complex components

### Phase 5: Integration Testing

1. Test component integrations
2. Test page layouts

## Coverage Goals

| Component Type | Coverage Target |
|----------------|-----------------|
| Utility functions | 90% |
| UI components | 80% |
| Hooks | 85% |
| Context providers | 85% |
| Pages | 70% |

## Continuous Integration

Add testing to CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Generate coverage report
      run: npm run test:coverage
      
    - name: Upload coverage report
      uses: codecov/codecov-action@v3
``` 