import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypePunctilio from 'punctilio/rehype';

// Promote paragraphs whose only meaningful child is a single inline-math
// element into centered display math. remark-math treats single-line $$x$$
// as inline math, so by default these end up left-aligned even though they
// stand alone — this tags the wrapping <p> so it can be centered via CSS.
function rehypeCenterMathParagraphs() {
    return (tree) => {
        const visit = (node) => {
            if (node.type !== 'element' || node.tagName !== 'p' || !node.children) return;
            const meaningful = node.children.filter((c) =>
                !(c.type === 'text' && /^\s*$/.test(c.value))
            );
            if (meaningful.length !== 1) return;
            const only = meaningful[0];
            if (only.type !== 'element' || only.tagName !== 'span') return;
            const cls = only.properties?.className;
            const classes = Array.isArray(cls) ? cls : (typeof cls === 'string' ? cls.split(/\s+/) : []);
            if (!classes.includes('katex')) return;
            const pCls = node.properties?.className;
            const pClasses = Array.isArray(pCls) ? pCls : (typeof pCls === 'string' ? pCls.split(/\s+/) : []);
            pClasses.push('math-display-wrap');
            node.properties = { ...(node.properties || {}), className: pClasses };
        };
        const walk = (n) => {
            visit(n);
            (n.children || []).forEach(walk);
        };
        walk(tree);
    };
}

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
    rehypeCenterMathParagraphs,
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
    rehypeCenterMathParagraphs,
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
