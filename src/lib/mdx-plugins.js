/**
 * Shared MDX plugin configuration for blog rendering
 * Used by both server-side (mdx.js) and client-side (ProtectedContent) rendering
 */

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';

/**
 * Singleton Shiki highlighter for code syntax highlighting
 * Prevents re-initialization on every request
 */
let shikiHighlighterPromise = null;

async function getShikiHighlighter(highlighterOpts) {
    if (!shikiHighlighterPromise) {
        const shiki = await import('shiki');
        shikiHighlighterPromise = shiki.getHighlighter({
            ...highlighterOpts,
            langs: highlighterOpts.langs || [
                'javascript', 'typescript', 'jsx', 'tsx', 'python',
                'html', 'css', 'json', 'yaml', 'markdown', 'bash', 'shell', 'diff'
            ]
        });
    }
    return shikiHighlighterPromise;
}

/**
 * Remark plugins for markdown processing
 */
export const remarkPlugins = [
    remarkGfm,    // GitHub Flavored Markdown (tables, strikethrough, etc.)
    remarkMath,   // Math equations ($$...$$ and $...$)
    remarkToc,    // Table of contents generation
];

/**
 * Remark plugins without TOC (for protected content client-side rendering)
 */
export const remarkPluginsNoToc = [
    remarkGfm,
    remarkMath,
];

/**
 * Rehype plugins for HTML transformation (server-side with Shiki caching)
 */
export const rehypePlugins = [
    rehypeKatex,  // LaTeX rendering via KaTeX
    [rehypePrettyCode, {
        keepBackground: true,
        theme: 'one-dark-pro',
        defaultLang: 'plaintext',
        getHighlighter: getShikiHighlighter,
    }],
    rehypeSlug,   // Add IDs to headings
];

/**
 * Rehype plugins for client-side rendering (no Shiki caching)
 */
export const rehypePluginsClient = [
    rehypeKatex,
    [rehypePrettyCode, {
        keepBackground: true,
        theme: 'one-dark-pro',
        defaultLang: 'plaintext',
    }],
    rehypeSlug,
];

/**
 * Full MDX options for server-side compilation
 */
export const mdxOptions = {
    remarkPlugins,
    rehypePlugins,
    format: 'mdx',
};

/**
 * MDX options for client-side protected content
 */
export const mdxOptionsClient = {
    remarkPlugins: remarkPluginsNoToc,
    rehypePlugins: rehypePluginsClient,
    format: 'mdx',
};
