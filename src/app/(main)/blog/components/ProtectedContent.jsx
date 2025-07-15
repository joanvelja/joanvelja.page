'use client';

import { useState, useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { PasswordProtection } from './PasswordProtection';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { LockClosedIcon } from '@heroicons/react/24/outline';

// Import the same components used in the regular MDX rendering
import { Sidenote } from '@/components/Sidenote';
import { HeadingWithAnchor } from '@/components/HeadingWithAnchor';
import { MarginNote } from '@/components/MarginNote';
import { Citation, Cite, Bibliography } from '@/components/Citation';
import { DarkModeImageWrapper } from '@/components/DarkModeImageWrapper';
import { ImageThemeAdjuster } from '@/components/ImageThemeAdjuster';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// MDX components (same as in mdx.js)
const components = {
  h1: ({ children, ...props }) => {
    const id = slugify(children?.toString() || '');
    return (
      <HeadingWithAnchor
        as="h1"
        id={id}
        className="text-3xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white font-serif"
        {...props}
      >
        {children}
      </HeadingWithAnchor>
    );
  },
  h2: ({ children, ...props }) => {
    const id = slugify(children?.toString() || '');
    return (
      <HeadingWithAnchor
        as="h2"
        id={id}
        className="text-2xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white font-serif"
        {...props}
      >
        {children}
      </HeadingWithAnchor>
    );
  },
  h3: ({ children, ...props }) => {
    const id = slugify(children?.toString() || '');
    return (
      <HeadingWithAnchor
        as="h3"
        id={id}
        className="text-xl font-bold mt-6 mb-3 text-neutral-900 dark:text-white font-serif"
        {...props}
      >
        {children}
      </HeadingWithAnchor>
    );
  },
  h4: ({ children, ...props }) => {
    const id = slugify(children?.toString() || '');
    return (
      <HeadingWithAnchor
        as="h4"
        id={id}
        className="text-lg font-bold mt-6 mb-3 text-neutral-900 dark:text-white font-serif"
        {...props}
      >
        {children}
      </HeadingWithAnchor>
    );
  },
  p: (props) => <p {...props} className="mb-6 text-neutral-700 dark:text-neutral-300 leading-[1.8] tracking-[0.01em] text-[1.05rem] font-serif" />,
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
  img: (props) => {
    // Don't render if src is missing, empty string, or an empty object
    if (!props.src || props.src === '' || (typeof props.src === 'object' && Object.keys(props.src).length === 0)) {
      return null;
    }
    
    // Use our dark mode image wrapper component for better dark mode support
    return (
      <div className="my-4">
        <DarkModeImageWrapper
          src={props.src}
          alt={props.alt || "Image"}
          className="w-full"
          rounded="rounded-lg"
        />
        {props.alt && props.alt !== "Image" && (
          <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-1 italic font-serif">
            {props.alt}
          </p>
        )}
      </div>
    );
  },
  // Add our ImageThemeAdjuster component to be directly usable in MDX
  ImageThemeAdjuster,
  DarkModeImageWrapper,
  Sidenote,
  MarginNote,
  // Citation components
  Citation,
  Cite,
  Bibliography,
};

export function ProtectedContent({ post }) {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [mdxSource, setMdxSource] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [readingTime, setReadingTime] = useState(null);

  // Handle successful decryption
  const handleDecrypt = async (decryptedContent) => {
    setIsProcessing(true);
    
    try {
      // Calculate the reading time from the decrypted content
      const wordsPerMinute = 200;
      const wordCount = decryptedContent.split(/\s+/g).length;
      const calculatedReadingTime = Math.ceil(wordCount / wordsPerMinute);
      setReadingTime(calculatedReadingTime);
      
      // Process the decrypted MDX content
      const mdxSource = await serialize(decryptedContent, {
        mdxOptions: {
          remarkPlugins: [
            remarkGfm,
            remarkMath,
          ],
          rehypePlugins: [
            rehypeKatex,
            [rehypePrettyCode, {
              keepBackground: true,
              theme: 'one-dark-pro',
              defaultLang: 'plaintext',
            }],
            rehypeSlug,
          ],
          format: 'mdx',
        },
        parseFrontmatter: true,
      });
      
      // Set the processed MDX source
      setMdxSource(mdxSource);
      setIsDecrypted(true);
      
      // Store a flag in session storage to remember this post was decrypted
      // This allows the content to persist during the session but not permanently
      sessionStorage.setItem(`decrypted-${post.slug}`, 'true');
      
    } catch (error) {
      console.error('Error processing decrypted content:', error);
      setIsDecrypted(false);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Check if this post was previously decrypted in this session
  useEffect(() => {
    const wasDecrypted = sessionStorage.getItem(`decrypted-${post.slug}`);
    if (wasDecrypted === 'true') {
      // If it was decrypted before, prompt for password again
      // This is more secure than storing the decrypted content
      setIsDecrypted(false);
    }
  }, [post.slug]);
  
  // Clear decrypted state when unmounting
  useEffect(() => {
    return () => {
      setMdxSource(null);
      setIsDecrypted(false);
    };
  }, []);

  if (isProcessing) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-pulse text-center">
          <div className="mx-auto w-12 h-12 border-4 border-neutral-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Decrypting content...</p>
        </div>
      </div>
    );
  }

  if (!isDecrypted || !mdxSource) {
    return <PasswordProtection post={post} onDecrypt={handleDecrypt} />;
  }

  return (
    <div className="protected-content">
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 mr-2" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              You are viewing protected content. This content will remain accessible during your current session.
            </p>
          </div>
          {readingTime && (
            <span className="text-sm text-blue-700 dark:text-blue-400 whitespace-nowrap ml-2">
              {readingTime} min read
            </span>
          )}
        </div>
      </div>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none blog-content">
        <MDXRemote {...mdxSource} components={components} />
      </div>
    </div>
  );
} 