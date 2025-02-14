import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { compileMDX } from 'next-mdx-remote/rsc';

// Configuration for MDX processing
const options = {
    parseFrontmatter: true,
    mdxOptions: {
        remarkPlugins: [
            remarkGfm,    // GitHub Flavored Markdown
            remarkMath,   // Math equations
            remarkToc,    // Table of contents
        ],
        rehypePlugins: [
            rehypeKatex,  // LaTeX rendering
            [rehypePrettyCode, {
                keepBackground: true,
                theme: 'one-dark-pro',
                defaultLang: 'plaintext',
            }],
            rehypeSlug,   // Add IDs to headings
        ],
        format: 'mdx',
    },
};

// Get all blog posts
export async function getAllPosts() {
    const postsDirectory = path.join(process.cwd(), 'content/blog');
    const filenames = fs.readdirSync(postsDirectory);

    const posts = await Promise.all(
        filenames
            .filter(filename => filename.endsWith('.mdx'))
            .map(async filename => {
                const filePath = path.join(postsDirectory, filename);
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const { data, content } = matter(fileContents);
                const slug = filename.replace(/\.mdx$/, '');

                // Calculate reading time (rough estimate)
                const wordsPerMinute = 200;
                const wordCount = content.split(/\s+/g).length;
                const readingTime = Math.ceil(wordCount / wordsPerMinute);

                return {
                    slug,
                    ...data,
                    readingTime,
                };
            })
    );

    // Sort posts by date
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get a single post by slug
export async function getPostBySlug(slug) {
    const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    // Calculate reading time (rough estimate)
    const wordsPerMinute = 200;
    const wordCount = fileContents.split(/\s+/g).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    // Compile MDX content
    const { content } = await compileMDX({
        source: fileContents,
        options: {
            ...options,
            mdxOptions: {
                ...options.mdxOptions,
                rehypePlugins: [
                    rehypeKatex,  // LaTeX rendering
                    [rehypePrettyCode, {
                        keepBackground: true,
                        theme: 'one-dark-pro',
                        defaultLang: 'plaintext',
                        // Add scrollbar styling to code blocks
                        onVisitLine(node) {
                            // Prevent lines from wrapping
                            if (node.children.length === 0) {
                                node.children = [{type: 'text', value: ' '}];
                            }
                        },
                        onVisitHighlightedLine(node) {
                            node.properties.className.push('highlighted');
                        },
                        onVisitHighlightedWord(node) {
                            node.properties.className = ['word'];
                        },
                    }],
                    rehypeSlug,   // Add IDs to headings
                ],
            },
        }
    });

    return {
        slug,
        content,
        ...data,
        readingTime,
    };
} 