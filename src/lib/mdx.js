import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { mdxComponents } from './mdx-components';
import { mdxOptions } from './mdx-plugins';

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

                const wordsPerMinute = 200;
                let readingTime;

                if (data.isProtected) {
                    readingTime = data.estimatedReadingTime || 5;
                } else {
                    const wordCount = content.split(/\s+/g).length;
                    readingTime = Math.ceil(wordCount / wordsPerMinute);
                }

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
                    };
                }

                return {
                    slug,
                    ...data,
                    readingTime,
                };
            })
    );

    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get raw post data (uncached function)
const getPostRawDataUncached = async (slug) => {
    const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content: rawContent } = matter(fileContents);

    const wordsPerMinute = 200;

    if (data.isProtected) {
        return {
            slug,
            title: data.title,
            date: data.date,
            excerpt: data.excerpt || 'This post is password protected.',
            tags: data.tags || [],
            image: data.image || null,
            readingTime: data.estimatedReadingTime || 5,
            isProtected: true,
            iv: data.iv,
            authTag: data.authTag,
            encryptedContent: data.encryptedContent,
        };
    }

    const wordCount = rawContent.split(/\s+/g).length;

    return {
        slug,
        rawContent: fileContents,
        ...data,
        readingTime: Math.ceil(wordCount / wordsPerMinute),
    };
};

// Cached version of getPostRawData
const getPostRawData = cache(async (slug) => {
    return unstable_cache(
        async () => getPostRawDataUncached(slug),
        [`post-${slug}`],
        { tags: [`post-${slug}`], revalidate: 3600 }
    )();
});

// Get a single post by slug
export async function getPostBySlug(slug) {
    const postData = await getPostRawData(slug);

    if (postData.isProtected) {
        return postData;
    }

    const compiledContent = await compileMDX({
        source: postData.rawContent,
        components: mdxComponents,
        options: {
            parseFrontmatter: true,
            mdxOptions,
        },
    });

    const { rawContent, ...rest } = postData;

    return {
        ...rest,
        content: compiledContent.content,
    };
}