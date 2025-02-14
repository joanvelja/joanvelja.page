'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

// Tag component for reusability
const Tag = ({ type }) => {
    const colors = {
        intern: 'bg-orange-100 text-orange-800',
        student: 'bg-purple-100 text-purple-800',
        hackathon: 'bg-pink-100 text-pink-800',
        freelance: 'bg-blue-100 text-blue-800',
        web: 'bg-green-100 text-green-800',
        founder: 'bg-cyan-100 text-cyan-800',
        ai: 'bg-gray-100 text-gray-800',
        'Visiting Researcher': 'bg-red-100 text-red-800',
        Researcher: 'bg-blue-100 text-blue-800'
    };

    return (
        <span className={`px-2 py-0.5 rounded-md text-sm font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
            {type}
        </span>
    );
};

// WorkListItem component
const WorkListItem = ({ name, type, location, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-start justify-between p-4 cursor-pointer transition-all duration-300
            border-b border-neutral-100 dark:border-neutral-800 last:border-b-0
            ${isSelected ? 'bg-neutral-50 dark:bg-neutral-800' : 'hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50'}`}
    >
        <span className="text-neutral-900 dark:text-white font-medium">{name}</span>
        <div className="flex flex-col items-end gap-1">
            <Tag type={type} />
            <span className="text-neutral-500 dark:text-neutral-400 text-xs">{location}</span>
        </div>
    </div>
);

// Add this helper function near the top of the file
const renderTextWithLinks = (text) => {
    if (!text) return null;
    
    // Match [text](url) pattern
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    
    return parts.map((part, index) => {
        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
            const [_, text, url] = match;
            return (
                <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    {text}
                </a>
            );
        }
        return part;
    });
};

// WorkDetailPanel component
const WorkDetailPanel = ({ project, onClose }) => {
    if (!project) return null;

    const renderRelatedLink = (link) => {
        const icons = {
            arxiv: '📜',
            github: '🔗',
            website: '🌐',
            pdf: '📄'
        };

        return (
            <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-2 group"
            >
                {icons[link.type]} <span className="group-hover:underline">{link.text}</span>
            </a>
        );
    };

    const renderRelatedWork = (work) => (
        <div key={work.title} className="border-l-2 border-neutral-200 dark:border-neutral-700 pl-4 py-2">
            <p className="text-neutral-900 dark:text-white font-medium">{work.title}</p>
            
            {/* Supervisor first - if exists */}
            {work.supervisor && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Supervised by{' '}
                    <a 
                        href={work.supervisor_link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        {work.supervisor}
                    </a>
                </p>
            )}
            
            {/* Description with inline links */}
            {work.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {renderTextWithLinks(work.description)}
                </p>
            )}
            
            {/* Co-authors with superscript dagger */}
            {work.coauthors && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Authors: {work.coauthors.split('*').join('<sup>†</sup>').split(', ').map((author, i, arr) => (
                        <span key={author} dangerouslySetInnerHTML={{
                            __html: author + (i === arr.length - 1 ? '' : ', ')
                        }} />
                    ))}
                </p>  
            )}

            {work.publication_venue && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Publication Venue: {work.publication_venue}
                </p>
            )}
            
            {/* Links */}
            {work.links && (
                <div className="flex flex-col gap-1 mt-2">
                    {work.links.map(renderRelatedLink)}
                </div>
            )}
            
            {/* Equal contribution footnote - only if there are co-authors with asterisks */}
            {work.coauthors?.includes('*') && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 italic">
                    <sup>†</sup> Equal contribution
                </p>
            )}
        </div>
    );

    return (
        <div className={`fixed top-0 right-0 h-screen w-[400px] bg-white dark:bg-neutral-900 shadow-2xl 
            transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-right overflow-hidden
            ${project ? 'translate-x-0 scale-x-100 opacity-100' : 'translate-x-[50%] scale-x-0 opacity-0'}`}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 
                    transition-colors duration-300 z-10"
            >
                <X className="w-5 h-5 text-neutral-500" />
            </button>
            
            <div className="h-full flex flex-col">
                {/* Fixed Header */}
                <div className="p-6 pb-2 bg-white dark:bg-neutral-900">
                    <h2 className="text-2xl font-medium text-neutral-900 dark:text-white mt-8">{project.name}</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 capitalize mt-4">{project.type} - {project.location}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{project.period}</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 pt-2
                    [&::-webkit-scrollbar]:w-2 
                    [&::-webkit-scrollbar-track]:bg-neutral-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-800
                    [&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600
                    [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
                    {project.links?.map(renderRelatedLink)}
                    
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white">About</h3>
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{project.description}</p>
                        
                        {project.relatedWorks?.length > 0 && (
                            <>
                                <h4 className="text-lg font-medium text-neutral-900 dark:text-white mt-6">Publications & Projects</h4>
                                <div className="space-y-4">
                                    {project.relatedWorks.map(renderRelatedWork)}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main page component
export default function ProjectsPage() {
    const [selectedProject, setSelectedProject] = useState(null);

    const projects = {
        present: [
            {
                name: 'University of Oxford',
                type: 'Visiting Researcher',
                description: 'Writing my MSc thesis, supervised by Prof. Alessandro Abate, on Prover-Verifier Games.',
                location: 'Oxford, UK',
                period: 'Jan 2025 - Present',
                links: [
                    // {
                    //     type: 'github',
                    //     url: 'https://github.com/joanvelja/prover-verifier-games',
                    //     text: 'GitHub Codebase'
                    // }
                ],
                // relatedWorks: [
                //     {
                //         title: 'Prover-Verifier Games in Neural Networks',
                //         description: 'Research paper exploring verification games in neural architectures',
                //         links: [
                //             {
                //                 type: 'arxiv',
                //                 url: 'https://arxiv.org/abs/example',
                //                 text: 'Read on arXiv'
                //             },
                //             {
                //                 type: 'pdf',
                //                 url: '/papers/example.pdf',
                //                 text: 'Download PDF'
                //             }
                //         ]
                //     }
                // ]
            },
            {
                name: 'University of Amsterdam',
                type: 'Masters',
                description: 'Masters in Artificial Intelligence',
                location: 'Amsterdam, Netherlands',
                period: 'Sept 2023 - Present',
                relatedWorks: [
                    {
                        title: 'Dynamic Vocabulary Pruning in Early-Exit LLMs',
                        description: 'Studied the gains in efficiency from pruning the vocabulary matrix of LLMs under early-exit [(Schuster et al. 2022)](https://arxiv.org/abs/2207.07061) settings.',
                        supervisor: 'Metod Jazbec',
                        supervisor_link: 'https://metodj.github.io/',
                        coauthors: 'Jort Vincenti*, Karim Abdel Sadek*, Joan Velja*, Matteo Nulli*, Metod Jazbec',
                        links: [
                            {
                                type: 'arxiv',
                                url: 'https://arxiv.org/abs/2410.18952',
                                text: 'Read on arXiv'
                            }
                        ]
                    }
                ]
            }
        ],
        past: [
            {
                name: 'LASR Labs (London Initiative for Safe AI)',
                type: 'Researcher', 
                description: 'Wrote a cool paper on steganographic collusion between Language Models!', location: 'London, UK', 
                period:'Jul 2024 - Oct 2024',
                relatedWorks: [
                    {
                        title: 'Hidden in Plain Text: Emergence & Mitigation of Steganographic Collusion in LLMs',
                        description: 'Wrote a cool paper on steganographic collusion between Language Models! Cited by Deepmind [(MONA, Farquhar et al. 2025)](https://arxiv.org/abs/2501.13011), and mentioned by Anthropic as a influential safety paper in 2024 ([here](https://x.com/saprmarks/status/1873551162919506068) and [here](https://www.lesswrong.com/posts/nAsMfmxDv6Qp7cfHh/fabien-s-shortform?commentId=gGDAXomb2ihucF4Ls)). Finally, Open Philanthropy is funding further research on the topic, as seen [here](https://arc.net/l/quote/xxtlyguv).',
                        coauthors: 'Yohan Mathew*, Ollie Matthews*, Robert McCarthy*, Joan Velja*, Christian Schroeder de Witt, Dylan Cope, Nandi Schoots',
                        publication_venue: 'NeurIPS - SoLaR Workshop 2024',
                        links: [
                            {
                                type: 'arxiv',
                                url: 'https://arxiv.org/abs/2410.03768',
                                text: 'Read on arXiv'
                            },
                            {
                                type: 'github',
                                url: 'https://github.com/olliematthews/lasr-steganography/tree/master',
                                text: 'GitHub Codebase'
                            }
                        ]
                    }
                ]
            },
            {
                name: 'University of Technology Sydney',
                type: 'Bachelors',
                description: 'Bachelors in Artificial Intelligence - Exchange Program',
                location: 'Sydney, Australia',
                period: 'Feb 2023 - Jul 2023',
            },
            { 
                name: 'Università Bocconi',
                type: 'Bachelors',
                description: 'Bachelors in Economics and Computer Science', 
                location: 'Milan, Italy', 
                period:'Sept 2020 - Jul 2023',
                relatedWorks: [
                    {
                        title: ' An unorthodox shift in the variance-bias tradeoff in Neural Networks: the double descent phenomenon and the ease of training in the overparametrized regime.',
                        description: 'I was supervised by Prof. Enrico Maria Malatesta, and our work on Singular Learning Theory culminated into my Thesis, which I defended with distinction.',
                        coauthors: 'Joan Velja, Enrico Maria Malatesta',
                        links: [
                            {
                                type: 'pdf',
                                url: '/papers/BSc_Thesis.pdf',
                                text: 'See my BSc Thesis PDF'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    return (
        <main className="flex flex-col items-center justify-start w-full h-[calc(100vh-120px)] animate-fade-in">
            <section className="w-full max-w-[540px] h-full flex flex-col px-4">
                <div className="flex-1 overflow-y-auto space-y-8 py-8 [&::-webkit-scrollbar]:w-2 
                    [&::-webkit-scrollbar-track]:bg-neutral-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-800
                    [&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600
                    [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
                    {/* Present Section */}
                    <div>
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 px-4">Present</h3>
                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
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
                    <div>
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 px-4">Past</h3>
                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
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

            {/* Detail Panel */}
            <WorkDetailPanel
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </main>
    );
} 