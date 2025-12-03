import Image from 'next/image';
import { DarkModeImageWrapper } from './DarkModeImageWrapper';

/**
 * Custom components for MDX rendering with improved dark mode support
 */
export const MDXComponents = {
  // Basic components with custom styling
  h1: (props) => <h1 {...props} className="text-3xl font-bold mt-8 mb-4 font-serif text-neutral-900 dark:text-neutral-100" />,
  h2: (props) => <h2 {...props} className="text-2xl font-bold mt-8 mb-4 font-serif text-neutral-900 dark:text-neutral-100" />,
  h3: (props) => <h3 {...props} className="text-xl font-bold mt-6 mb-3 font-serif text-neutral-900 dark:text-neutral-100" />,
  h4: (props) => <h4 {...props} className="text-lg font-bold mt-6 mb-3 font-serif text-neutral-900 dark:text-neutral-100" />,
  p: (props) => <p {...props} className="mb-6 text-neutral-700 dark:text-neutral-300 leading-[1.8] text-[1.05rem] font-serif" />,
  ul: (props) => <ul {...props} className="mb-6 list-disc ml-4 space-y-2 text-neutral-700 dark:text-neutral-300 leading-[1.8] text-[1.05rem] font-serif" />,
  ol: (props) => <ol {...props} className="mb-6 list-decimal ml-4 space-y-2 text-neutral-700 dark:text-neutral-300 leading-[1.8] text-[1.05rem] font-serif" />,
  li: (props) => <li {...props} className="text-neutral-700 dark:text-neutral-300 leading-[1.8] text-[1.05rem] font-serif" />,
  blockquote: (props) => (
    <blockquote {...props} className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 my-6 italic text-neutral-600 dark:text-neutral-400 leading-[1.8] text-[1.05rem] font-serif" />
  ),
  a: (props) => (
    <a {...props} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" />
  ),
  code: (props) => {
    if (typeof props.children === 'string') {
      return <code {...props} className="bg-neutral-100 dark:bg-neutral-800 rounded px-1 py-0.5 text-sm font-mono" />;
    }
    return <code {...props} />;
  },
  pre: (props) => (
    <pre {...props} className="bg-neutral-900 rounded-lg p-4 mb-4 overflow-x-auto" />
  ),
  
  // Enhanced image component with dark mode support
  img: (props) => {
    // Use our dark mode image wrapper for standard markdown images
    return (
      <div className="my-8">
        <DarkModeImageWrapper
          src={props.src}
          alt={props.alt || "Image"}
          className="aspect-auto w-full"
          rounded="rounded-lg"
        />
        {props.alt && props.alt !== "Image" && (
          <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-2 italic font-serif">
            {props.alt}
          </p>
        )}
      </div>
    );
  },
}; 