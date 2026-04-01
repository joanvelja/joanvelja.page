import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypePunctilio from 'punctilio/rehype';

let shikiHighlighterPromise = null;

async function getShikiHighlighter(highlighterOpts) {
    if (!shikiHighlighterPromise) {
        const shiki = await import('shiki');
        const createFn = shiki.createHighlighter || shiki.getHighlighter;
        shikiHighlighterPromise = createFn({
            ...highlighterOpts,
            langs: highlighterOpts.langs || [
                'javascript', 'typescript', 'jsx', 'tsx', 'python',
                'html', 'css', 'json', 'yaml', 'markdown', 'bash', 'shell', 'diff'
            ]
        });
    }
    return shikiHighlighterPromise;
}

const remarkPlugins = [
    remarkGfm,
    remarkMath,
    remarkToc,
];

const remarkPluginsNoToc = [
    remarkGfm,
    remarkMath,
];

const rehypePlugins = [
    rehypeKatex,
    [rehypePrettyCode, {
        keepBackground: true,
        theme: 'one-dark-pro',
        defaultLang: 'plaintext',
        getHighlighter: getShikiHighlighter,
    }],
    rehypeSlug,
    rehypePunctilio,
];

const rehypePluginsClient = [
    rehypeKatex,
    [rehypePrettyCode, {
        keepBackground: true,
        theme: 'one-dark-pro',
        defaultLang: 'plaintext',
    }],
    rehypeSlug,
    rehypePunctilio,
];

export const mdxOptions = {
    remarkPlugins,
    rehypePlugins,
    format: 'mdx',
};

export const mdxOptionsClient = {
    remarkPlugins: remarkPluginsNoToc,
    rehypePlugins: rehypePluginsClient,
    format: 'mdx',
};
