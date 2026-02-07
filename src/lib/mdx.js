import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { mdxComponents } from './mdx-components';
import { mdxOptions } from './mdx-plugins';

function estimateReadingTime(content, isProtected, estimatedReadingTime) {
    if (isProtected) return estimatedReadingTime || 5;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
}

export async function getAllPosts() {
    const postsDirectory = path.join(process.cwd(), 'content/blog');
    const filenames = await fs.readdir(postsDirectory);

    const posts = await Promise.all(
        filenames
            .filter(filename => filename.endsWith('.mdx'))
            .map(async filename => {
                const filePath = path.join(postsDirectory, filename);
                const fileContents = await fs.readFile(filePath, 'utf8');
                const { data, content } = matter(fileContents);
                const slug = filename.replace(/\.mdx$/, '');
                const readingTime = estimateReadingTime(content, data.isProtected, data.estimatedReadingTime);

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

const getPostRawDataUncached = async (slug) => {
    const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data, content: rawContent } = matter(fileContents);

    if (data.isProtected) {
        return {
            slug,
            title: data.title,
            date: data.date,
            excerpt: data.excerpt || 'This post is password protected.',
            tags: data.tags || [],
            image: data.image || null,
            readingTime: estimateReadingTime(rawContent, true, data.estimatedReadingTime),
            isProtected: true,
            iv: data.iv,
            authTag: data.authTag,
            encryptedContent: data.encryptedContent,
        };
    }

    return {
        slug,
        rawContent: fileContents,
        ...data,
        readingTime: estimateReadingTime(rawContent, false),
    };
};

const getPostRawData = cache(async (slug) => {
    return unstable_cache(
        async () => getPostRawDataUncached(slug),
        [`post-${slug}`],
        { tags: [`post-${slug}`], revalidate: 3600 }
    )();
});

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

    const { rawContent: _rawContent, ...rest } = postData;

    return {
        ...rest,
        content: compiledContent.content,
    };
}
