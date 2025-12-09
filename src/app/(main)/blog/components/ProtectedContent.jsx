'use client';

import { useState, useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { PasswordProtection } from './PasswordProtection';
import { Lock } from 'lucide-react';

import { mdxComponents } from '@/lib/mdx-components';
import { mdxOptionsClient } from '@/lib/mdx-plugins';

export function ProtectedContent({ post }) {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [mdxSource, setMdxSource] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [readingTime, setReadingTime] = useState(null);

  const handleDecrypt = async (decryptedContent) => {
    setIsProcessing(true);

    try {
      const wordsPerMinute = 200;
      const wordCount = decryptedContent.split(/\s+/g).length;
      setReadingTime(Math.ceil(wordCount / wordsPerMinute));

      const source = await serialize(decryptedContent, {
        mdxOptions: mdxOptionsClient,
        parseFrontmatter: true,
      });

      setMdxSource(source);
      setIsDecrypted(true);
      sessionStorage.setItem(`decrypted-${post.slug}`, 'true');
    } catch (error) {
      console.error('Error processing decrypted content:', error);
      setIsDecrypted(false);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const wasDecrypted = sessionStorage.getItem(`decrypted-${post.slug}`);
    if (wasDecrypted === 'true') {
      setIsDecrypted(false);
    }
  }, [post.slug]);

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
          <div className="mx-auto w-12 h-12 border-4 border-neutral-300 border-t-blue-500 rounded-full animate-spin mb-4" />
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
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 mr-2" />
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
        <MDXRemote {...mdxSource} components={mdxComponents} />
      </div>
    </div>
  );
}