'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects } from '@/lib/projectsData';

// Tag component for reusability
const Tag = ({ type }) => {
    const colors = {
        intern: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        student: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        hackathon: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
        freelance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        web: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        founder: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
        ai: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        'Visiting Researcher': 'bg-crimson-100 text-crimson-800 dark:bg-crimson-900/30 dark:text-crimson-300',
        Researcher: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        Masters: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
        Bachelors: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border border-transparent ${colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
            {type}
        </span>
    );
};

// WorkListItem component
const WorkListItem = ({ name, type, location, period, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`group flex items-center justify-between p-5 cursor-pointer transition-all duration-300
            border border-transparent rounded-xl mb-3
            ${isSelected
                ? 'bg-white dark:bg-neutral-800 shadow-md border-neutral-200 dark:border-neutral-700 scale-[1.02]'
                : 'hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm hover:border-neutral-200 dark:hover:border-neutral-700 hover:scale-[1.01]'}`}
    >
        <div className="flex flex-col gap-1">
            <span className={`font-serif text-lg font-medium transition-colors ${isSelected ? 'text-crimson-600 dark:text-crimson-400' : 'text-neutral-900 dark:text-white group-hover:text-crimson-600 dark:group-hover:text-crimson-400'}`}>
                {name}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-sans">{location} • {period}</span>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Tag type={type} />
            <ChevronRight size={16} className={`text-neutral-400 transition-transform duration-300 ${isSelected ? 'rotate-90 text-crimson-500' : 'group-hover:translate-x-1'}`} />
        </div>
    </div>
);

// Helper for links
const renderTextWithLinks = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, index) => {
        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
            const [_, text, url] = match;
            return (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-crimson-600 hover:text-crimson-700 dark:text-crimson-400 dark:hover:text-crimson-300 hover:underline">
                    {text}
                </a>
            );
        }
        return part;
    });
};

const LINK_ICONS = { arxiv: '📜', github: '🔗', website: '🌐', pdf: '📄' };

const renderRelatedLink = (link) => (
    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors group">
        <span>{LINK_ICONS[link.type]}</span>
        <span className="group-hover:text-crimson-600 dark:group-hover:text-crimson-400 transition-colors">{link.text}</span>
        <ExternalLink size={12} className="opacity-50 group-hover:opacity-100" />
    </a>
);

const renderRelatedWork = (work) => (
    <div key={work.title} className="group bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-5 border border-neutral-100 dark:border-neutral-800 hover:border-crimson-100 dark:hover:border-crimson-900/30 transition-colors">
        <h4 className="text-neutral-900 dark:text-white font-medium font-serif text-lg leading-tight group-hover:text-crimson-700 dark:group-hover:text-crimson-400 transition-colors">
            {work.title}
        </h4>

        {work.supervisor && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-sans">
                Supervised by <a href={work.supervisor_link} target="_blank" rel="noopener noreferrer" className="text-crimson-600 hover:underline">{work.supervisor}</a>
            </p>
        )}

        {work.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 font-serif leading-relaxed">
                {renderTextWithLinks(work.description)}
            </p>
        )}

        {work.coauthors && (
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3 font-sans leading-relaxed">
                <span className="font-semibold">Authors:</span> {work.coauthors.split('*').join('†').split(', ').map((author, i, arr) => (
                    <span key={author} className={author.includes('Joan Velja') ? 'text-neutral-900 dark:text-neutral-200 font-medium' : ''}>
                        {author}{i === arr.length - 1 ? '' : ', '}
                    </span>
                ))}
            </p>
        )}

        {work.publication_venue && (
            <div className="mt-3 inline-block px-2 py-1 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 font-sans">
                {work.publication_venue}
            </div>
        )}

        {work.links && (
            <div className="flex flex-wrap gap-2 mt-4 font-sans">
                {work.links.map(renderRelatedLink)}
            </div>
        )}
    </div>
);

// WorkDetailPanel component
const WorkDetailPanel = ({ project, onClose }) => {
    const handleKeyDown = (e) => {
        if (e.key !== 'Tab') return;
        const focusable = e.currentTarget.querySelectorAll(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            onKeyDown={handleKeyDown}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[480px] bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 z-50"
        >
            <div className="h-full flex flex-col">
                <div className="p-6 pb-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 z-10">
                    <div className="flex justify-between items-start mb-4">
                        <Tag type={project.type} />
                        <button autoFocus onClick={onClose} aria-label="Close panel" className="p-2 -mr-2 -mt-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-medium text-neutral-900 dark:text-white font-serif leading-tight">
                        {project.name}
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-sans text-sm flex items-center gap-2">
                        {project.location} • {project.period}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="font-sans flex flex-wrap gap-2">
                        {project.links?.map(renderRelatedLink)}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 font-sans">Overview</h3>
                            <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-serif text-lg">
                                {project.description}
                            </p>
                        </div>

                        {project.relatedWorks?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4 font-sans">Key Research & Projects</h3>
                                <div className="space-y-4">
                                    {project.relatedWorks.map(renderRelatedWork)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Main page component
export default function ProjectsPage() {
    const [selectedProject, setSelectedProject] = useState(null);

    const close = useCallback(() => setSelectedProject(null), []);

    useEffect(() => {
        if (!selectedProject) return;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedProject, close]);

    return (
        <main className="flex flex-col items-center justify-start w-full h-[calc(100vh-120px)] animate-fade-in">
            <section className="w-full max-w-2xl h-full flex flex-col px-4 md:px-0">
                <div className="flex-1 overflow-y-auto py-8 px-2 space-y-10 scrollbar-hide">

                    {/* Present Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4 px-2 font-sans">Current</h3>
                        <div className="space-y-2">
                            {projects.present.map((project) => (
                                <WorkListItem
                                    key={project.name}
                                    {...project}
                                    isSelected={selectedProject?.name === project.name}
                                    onClick={() => setSelectedProject(selectedProject?.name === project.name ? null : project)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Past Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4 px-2 font-sans">Previous</h3>
                        <div className="space-y-2">
                            {projects.past.map((project) => (
                                <WorkListItem
                                    key={project.name}
                                    {...project}
                                    isSelected={selectedProject?.name === project.name}
                                    onClick={() => setSelectedProject(selectedProject?.name === project.name ? null : project)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {selectedProject && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40"
                            onClick={close}
                        />
                        <WorkDetailPanel
                            key="panel"
                            project={selectedProject}
                            onClose={close}
                        />
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}
