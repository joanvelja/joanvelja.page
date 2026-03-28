'use client';

import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const plugins = [remarkMath];
const rehype = [rehypeKatex];

/**
 * Renders a string with inline LaTeX math.
 * Wraps in a span so it can be used inline.
 */
export function MathText({ children, className = '' }) {
  return (
    <span className={`math-text ${className}`}>
      <Markdown
        remarkPlugins={plugins}
        rehypePlugins={rehype}
        components={{
          p: ({ children }) => <>{children}</>,
        }}
      >
        {children}
      </Markdown>
    </span>
  );
}
