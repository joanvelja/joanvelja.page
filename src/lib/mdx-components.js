/**
 * Shared MDX component definitions for blog rendering
 * Used by both server-side (mdx.js) and client-side (ProtectedContent) rendering
 */

import { Sidenote } from '@/components/Sidenote';
import { HeadingWithAnchor } from '@/components/HeadingWithAnchor';
import { MarginNote } from '@/components/MarginNote';
import { Citation, Cite, Bibliography } from '@/components/Citation';
import { DarkModeImageWrapper } from '@/components/DarkModeImageWrapper';
import { ImageThemeAdjuster } from '@/components/ImageThemeAdjuster';
import { InteractiveEmbed } from '@/components/InteractiveEmbed';
import { cn } from '@/lib/utils';

function getNodeText(node) {
  if (['string', 'number'].includes(typeof node)) return node;
  if (node instanceof Array) return node.map(getNodeText).join('');
  if (typeof node === 'object' && node) return getNodeText(node.props?.children);
  return '';
}

export function slugify(text) {
  const str = typeof text === 'string' ? text : getNodeText(text);
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createHeadingComponent(level, className) {
  const Component = ({ children, ...props }) => {
    const id = slugify(children);
    return (
      <HeadingWithAnchor as={level} id={id} className={className} {...props}>
        {children}
      </HeadingWithAnchor>
    );
  };
  Component.displayName = `MDX${level.toUpperCase()}`;
  return Component;
}

const PROSE_BASE = 'text-neutral-700 dark:text-neutral-300 leading-[1.8] text-[1.05rem] font-serif';

export const mdxComponents = {
  h1: createHeadingComponent('h1', 'text-3xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white font-serif'),
  h2: createHeadingComponent('h2', 'text-2xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white font-serif'),
  h3: createHeadingComponent('h3', 'text-xl font-bold mt-6 mb-3 text-neutral-900 dark:text-white font-serif'),
  h4: createHeadingComponent('h4', 'text-lg font-bold mt-6 mb-3 text-neutral-900 dark:text-white font-serif'),

  p: (props) => (
    <p {...props} className={cn(PROSE_BASE, 'mb-6 tracking-[0.01em]')} />
  ),
  ul: (props) => (
    <ul {...props} className={cn(PROSE_BASE, 'mb-6 list-disc ml-4 space-y-2')} />
  ),
  ol: (props) => (
    <ol {...props} className={cn(PROSE_BASE, 'mb-6 list-decimal ml-4 space-y-2')} />
  ),
  li: (props) => (
    <li {...props} className={cn(PROSE_BASE)} />
  ),
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
    if (!props.src || props.src === '' || (typeof props.src === 'object' && Object.keys(props.src).length === 0)) {
      return null;
    }
    return (
      <div className="my-4">
        <DarkModeImageWrapper
          src={props.src}
          alt={props.alt || 'Image'}
          className="w-full"
          rounded="rounded-lg"
        />
        {props.alt && props.alt !== 'Image' && (
          <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-1 italic font-serif">
            {props.alt}
          </p>
        )}
      </div>
    );
  },

  Sidenote,
  MarginNote,
  DarkModeImageWrapper,
  ImageThemeAdjuster,
  InteractiveEmbed,
  Citation,
  Cite,
  Bibliography,
};
