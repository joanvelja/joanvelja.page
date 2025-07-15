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
import { Sidenote } from '@/components/Sidenote';
import { HeadingWithAnchor } from '@/components/HeadingWithAnchor';
import { MarginNote } from '@/components/MarginNote';
import { Citation, Cite, Bibliography } from '@/components/Citation';
import { DarkModeImageWrapper } from '@/components/DarkModeImageWrapper';
import { ImageThemeAdjuster } from '@/components/ImageThemeAdjuster';
import { InteractiveEmbed } from '@/components/InteractiveEmbed';

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// MDX components
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
        
        // Use our dark mode image wrapper component
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
    Sidenote,
    MarginNote,
    DarkModeImageWrapper,
    ImageThemeAdjuster,
    InteractiveEmbed,
    // Citation components
    Citation,
    Cite,
    Bibliography,
};

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
                getHighlighter: async (highlighterOpts) => {
                    // For shiki@1.x, we use getHighlighter directly
                    const shiki = await import('shiki');
                    return shiki.getHighlighter({
                        ...highlighterOpts, // This usually includes theme passed by rehype-pretty-code
                        langs: highlighterOpts.langs || ['javascript', 'typescript', 'jsx', 'tsx', 'python', 'html', 'css', 'json', 'yaml', 'markdown', 'bash', 'shell', 'diff']
                    });
                }
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
                
                // For protected posts, use a placeholder reading time or estimate from excerpt
                let readingTime;
                if (data.isProtected) {
                    // Use either a fixed reading time or estimate from non-encrypted parts
                    readingTime = data.estimatedReadingTime || 5; // Default to 5 minutes for protected posts
                } else {
                    const wordCount = content.split(/\s+/g).length;
                    readingTime = Math.ceil(wordCount / wordsPerMinute);
                }

                // For protected posts, return only safe metadata
                if (data.isProtected) {
                    return {
                        slug,
                        title: data.title,
                        date: data.date,
                        excerpt: data.excerpt || 'This post is password protected.',
                        tags: data.tags || [],
                        image: data.image || null,
                        readingTime,
                        isProtected: true,
                        // Don't include sensitive fields like passwordHash
                    };
                }

                // For regular posts, return all metadata
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
    const { data, content: rawContent } = matter(fileContents);

    // Calculate reading time (rough estimate)
    const wordsPerMinute = 200;
    
    let readingTime;
    let content;
    
    // Handle protected posts differently
    if (data.isProtected) {
        // For protected posts, don't compile MDX yet (it will be compiled after decryption)
        // Return the encrypted content data
        content = null; // Content will be decrypted client-side
        readingTime = data.estimatedReadingTime || 5;
        
        // Return necessary data for protected post
        return {
            slug,
            title: data.title,
            date: data.date,
            excerpt: data.excerpt || 'This post is password protected.',
            tags: data.tags || [],
            image: data.image || null,
            readingTime,
            isProtected: true,
            // Include encryption metadata needed for decryption, but never the passwordHash directly
            iv: data.iv,
            authTag: data.authTag,
            // Include encrypted content for client-side decryption
            encryptedContent: data.encryptedContent,
            // Never include the actual password or hash in the response
        };
    } else {
        // For regular posts, process as normal
        const wordCount = rawContent.split(/\s+/g).length;
        readingTime = Math.ceil(wordCount / wordsPerMinute);

        // Compile MDX content
        const compiledContent = await compileMDX({
            source: fileContents,
            components,
            options: {
                ...options,
                mdxOptions: {
                    ...options.mdxOptions,
                },
            }
        });

        return {
            slug,
            content: compiledContent.content,
            ...data,
            readingTime,
        };
    }
} 