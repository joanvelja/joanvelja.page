'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ArticleCard } from './ArticleCard';
import { TagPill } from './TagPill';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function ClientContent({ initialPosts, allTags }) {
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebouncedValue(searchQuery, 300);

    const filteredPosts = useMemo(() => {
        const query = debouncedSearch.toLowerCase();
        return initialPosts.filter(post => {
            const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
            const matchesSearch = query
                ? post.title?.toLowerCase().includes(query) ||
                  post.description?.toLowerCase().includes(query) ||
                  (post.tags || []).some(tag => tag.toLowerCase().includes(query))
                : true;
            return matchesTag && matchesSearch;
        });
    }, [initialPosts, selectedTag, debouncedSearch]);

    return (
        <>
            <div className="space-y-6 mb-8">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 transition-colors group-hover:text-neutral-500 dark:group-hover:text-neutral-300" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 
                                 bg-white/80 dark:bg-neutral-800/80
                                 border-b border-neutral-200 dark:border-neutral-700
                                 rounded-md
                                 text-neutral-800 dark:text-neutral-200 
                                 placeholder-neutral-400 dark:placeholder-neutral-500
                                 font-serif tracking-wide text-[0.95rem]
                                 transition-all duration-300
                                 focus:outline-none focus:border-oxford-300 dark:focus:border-oxford-700 focus:bg-white/90 dark:focus:bg-neutral-800/90"
                    />
                </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map(post => (
                    <ArticleCard key={post.slug} post={post} />
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="text-center py-16 px-4">
                    <div className="inline-block h-[1px] w-12 bg-neutral-300 dark:bg-neutral-700 mb-6"></div>
                    <p className="text-neutral-600 dark:text-neutral-400 font-serif italic mb-2">
                        No writings found for your search.
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500">
                        Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <div className="inline-block h-[1px] w-12 bg-neutral-300 dark:bg-neutral-700 mt-6"></div>
                </div>
            )}
        </>
    );
} 