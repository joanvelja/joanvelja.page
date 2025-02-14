'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { ArticleCard } from './ArticleCard';
import { TagPill } from './TagPill';

export function ClientContent({ initialPosts, allTags }) {
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter posts based on selected tag and search query
    const filteredPosts = initialPosts.filter(post => {
        const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
        const matchesSearch = searchQuery
            ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            : true;
        return matchesTag && matchesSearch;
    });

    return (
        <>
            {/* Search and Tags Section */}
            <div className="space-y-6 mb-8">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-neutral-800 
                                 border border-neutral-200 dark:border-neutral-700
                                 text-neutral-900 dark:text-white placeholder-neutral-500
                                 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
                    />
                </div>

                {/* Tags filter */}
                <div className="flex flex-wrap gap-2">
                    <TagPill
                        tag="All"
                        onClick={() => setSelectedTag(null)}
                        active={selectedTag === null}
                    />
                    {allTags.map(tag => (
                        <TagPill
                            key={tag}
                            tag={tag}
                            onClick={setSelectedTag}
                            active={selectedTag === tag}
                        />
                    ))}
                </div>
            </div>

            {/* Posts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map(post => (
                    <ArticleCard key={post.slug} post={post} />
                ))}
            </div>

            {/* Empty state */}
            {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-neutral-600 dark:text-neutral-400">
                        No posts found for your search.
                    </p>
                </div>
            )}
        </>
    );
} 