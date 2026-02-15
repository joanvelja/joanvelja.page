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
        },
        {
            name: 'LASR Labs (London Initiative for Safe AI)',
            type: 'Researcher',
            shortDescription: 'Steganographic collusion research, published at NeurIPS SoLaR 2024',
            description: 'Wrote a cool paper on steganographic collusion between Language Models!',
            location: 'London, UK',
            relatedWorks: [
                {
                    title: 'Hidden in Plain Text: Emergence & Mitigation of Steganographic Collusion in LLMs',
                    description: 'Wrote a cool paper on steganographic collusion between Language Models! Cited by Deepmind [(MONA, Farquhar et al. 2025)](https://arxiv.org/abs/2501.13011), and mentioned by Anthropic as a influential safety paper in 2024 ([here](https://x.com/saprmarks/status/1873551162919506068) and [here](https://www.lesswrong.com/posts/nAsMfmxDv6Qp7cfHh/fabien-s-shortform?commentId=gGDAXomb2ihucF4Ls)). Finally, Open Philanthropy is funding further research on the topic, as seen [here](https://arc.net/l/quote/xxtlyguv).',
                    coauthors: 'Yohan Mathew*, Ollie Matthews*, Robert McCarthy*, Joan Velja*, Christian Schroeder de Witt, Dylan Cope, Nandi Schoots',
                    publication_venue: 'NeurIPS - SoLaR Workshop 2024',
                    featured: true, // Mark as featured for landing page
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
                    description: 'I was supervised by Prof. Enrico Maria Malatesta, and our work on Singular Learning Theory culminated into my Thesis, which I defended with distinction.',
                    coauthors: 'Joan Velja, Enrico Maria Malatesta',
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
