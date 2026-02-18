export const projects = {
    present: [
        {
            name: 'University of Oxford',
            type: 'PhD',
            shortDescription: 'AI alignment and elicitation research, supervised by Prof. Alessandro Abate',
            description: 'D.Phil. student (fancy British for PhD), working on AI Alignment and Elicitation. Supervised by Prof. Alessandro Abate (OxCAV Group).',
            location: 'Oxford, UK',
            period: 'Sept 2025 - Present',
            links: [],
        },
        {
            name: 'LASR Labs',
            type: 'Researcher',
            shortDescription: 'Co-supervising red-teaming research on untrusted monitoring',
            description: 'Project co-supervisor on Red-teaming Untrusted Monitoring. Developing control evaluations for untrusted monitoring by relaxing human red-team coordination assumptions. Co-supervising with Charlie Griffin (UK AISI).',
            location: 'London, UK',
            period: 'Aug 2025 - Present',
            links: [],
            relatedWorks: [
                {
                    title: 'When Can We Trust an Untrusted Monitor?',
                    description: 'Untrusted monitoring uses one untrusted model to oversee another, shifting the core challenge from capability gaps to potential collusion. We relax prior assumptions about collusion by developing a taxonomy of collusion strategies and presenting an empirically grounded safety case sketch. We highlight key assumptions and open problems needed for robust pre-deployment evaluations.',
                    coauthors: 'Nelson Gardner-Challis*, Jonathan Bostock*, Georgiy Kozhevnikov*, Morgan Sinclaire*, Joan Velja, Alessandro Abate, Charlie Griffin',
                    publication_venue: 'LASR Labs preprint (2025)',
                    links: [
                        {
                            type: 'pdf',
                            url: 'https://www.lasrlabs.org/s/LASR_2025_UM_Paper.pdf',
                            text: 'Read the preprint (PDF)'
                        }
                    ]
                }
            ]
        }
    ],
    past: [
        {
            name: 'University of Oxford',
            type: 'Visiting Researcher',
            shortDescription: 'Prover-Verifier Games research with Prof. Alessandro Abate',
            description: 'Working on Prover-Verifier Games, supervised by Prof. Alessandro Abate.',
            location: 'Oxford, UK',
            period: 'Jan 2025 - Jul 2025',
            links: [],
        },
        {
            name: 'University of Amsterdam',
            type: 'Masters',
            shortDescription: 'MSc in Artificial Intelligence',
            description: 'Masters in Artificial Intelligence',
            location: 'Amsterdam, Netherlands',
            period: 'Sept 2023 - 2025',
            relatedWorks: [
                {
                    title: 'Dynamic Vocabulary Pruning in Early-Exit LLMs',
                    description: 'Study of efficiency gains from pruning the output vocabulary in early-exit LLMs, characterizing speed–quality trade-offs across exit layers.',
                    supervisor: 'Metod Jazbec',
                    supervisor_link: 'https://metodj.github.io/',
                    coauthors: 'Jort Vincenti*, Karim Abdel Sadek*, Joan Velja*, Matteo Nulli*, Metod Jazbec',
                    publication_venue: 'arXiv preprint (2024)',
                    links: [
                        {
                            type: 'arxiv',
                            url: 'https://arxiv.org/abs/2410.18952',
                            text: 'Read on arXiv'
                        },
                        {
                            type: 'github',
                            url: 'https://github.com/matteonulli/vocabulary_pruning',
                            text: 'GitHub Codebase'
                        }
                    ]
                },
                {
                    title: "'Explaining RL Decisions with Trajectories': A Reproducibility Study",
                    description: 'We investigate the reproducibility of a trajectory-based method for explaining reinforcement learning decisions. We recover the experimental environments and validate several of the paper’s claims, extending the original analysis with additional quantitative metrics and experiments. We also document where evidence is inconclusive and what remains underspecified.',
                    coauthors: 'Karim Abdel Sadek, Matteo Nulli, Joan Velja, Jort Vincenti',
                    publication_venue: 'TMLR (2024)',
                    links: [
                        {
                            type: 'arxiv',
                            url: 'https://arxiv.org/abs/2411.07200',
                            text: 'Read on arXiv'
                        },
                        {
                            type: 'github',
                            url: 'https://github.com/karim-abdel/Explaining-RL-Decisions-with-Trajectories',
                            text: 'GitHub Codebase'
                        }
                    ]
                }
            ]
        },
        {
            name: 'LASR Labs (London Initiative for Safe AI)',
            type: 'Researcher',
            shortDescription: 'Steganographic collusion research (IJCNLP-AACL 2025 oral; NeurIPS SoLaR 2024)',
            description: 'Research on steganographic collusion between language models, focusing on emergence mechanisms and mitigation approaches.',
            location: 'London, UK',
            period: 'Jul 2024 - Oct 2024',
            relatedWorks: [
                {
                    title: 'Hidden in Plain Text: Emergence & Mitigation of Steganographic Collusion in LLMs',
                    description: 'We study steganographic collusion: language models coordinating via hidden signals embedded in natural-language outputs. The paper analyzes when this behavior emerges and evaluates mitigation strategies.',
                    coauthors: 'Yohan Mathew*, Ollie Matthews*, Robert McCarthy*, Joan Velja*, Christian Schroeder de Witt, Dylan Cope, Nandi Schoots',
                    publication_venue: 'IJCNLP-AACL 2025 (Oral)',
                    featured: true, // Mark as featured for landing page
                    links: [
                        {
                            type: 'website',
                            url: 'https://aclanthology.org/2025.ijcnlp-long.34/',
                            text: 'ACL Anthology'
                        },
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
            shortDescription: 'BSc exchange semester in Artificial Intelligence',
            description: 'Bachelors in Artificial Intelligence - Exchange Program',
            location: 'Sydney, Australia',
            period: 'Feb 2023 - Jul 2023',
        },
        {
            name: 'Università Bocconi',
            type: 'Bachelors',
            shortDescription: 'BSc in Economics and Computer Science',
            description: 'Bachelors in Economics and Computer Science',
            location: 'Milan, Italy',
            period: 'Sept 2020 - Jul 2023',
            relatedWorks: [
                {
                    title: 'An unorthodox shift in the variance-bias tradeoff in Neural Networks',
                    description: 'BSc thesis on variance–bias trade-offs in neural networks through the lens of singular learning theory; defended with distinction.',
                    coauthors: 'Joan Velja, Enrico Maria Malatesta',
                    publication_venue: 'BSc thesis (Bocconi, 2023)',
                    links: [
                        {
                            type: 'pdf',
                            url: 'pdf/BSc_Thesis.pdf',
                            text: 'See my BSc Thesis PDF'
                        }
                    ]
                }
            ]
        }
    ]
};
