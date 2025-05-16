import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
    title: 'About | Joan Velja',
    description: 'Learn more about Joan Velja and his work.'
};

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


/* Make title dynamic */ 


export default function AboutPage() {
    return (
        <main className="flex flex-col items-center justify-start w-full animate-fade-in">
            {/* Profile Section */}
            <section className="w-full px-4 py-16 flex flex-col">
                {/* Profile Image */}
                <div className="flex justify-center w-full mb-12">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-800 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                        <div className="relative flex items-center justify-center">
                            <Image
                                alt="Profile picture"
                                src="/pfp/joan.png"
                                width={200}
                                height={200}
                                priority
                                className="rounded-full shadow-lg transition duration-300 hover:shadow-xl hover:animate-buzz"
                            />
                        </div>
                    </div>
                </div>

                {/* Greeting */}
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <h1 className="text-2xl font-medium text-neutral-800 dark:text-neutral-200 text-center font-serif">
                            Hi! I'm Joan.
                        </h1>
                        <br></br>
                    </div>

                {/* Scrollable Content Section is now just Content Section */}
                <div className="space-y-6 text-neutral-800 dark:text-neutral-200">

                    {/* Main Text */}
                    <div className="space-y-4">
                        <p className="text-lg leading-relaxed font-serif">
                            {renderTextWithLinks(`
                            If you stumbled upon this page, you might have a lot in common with me. I muse on the alignment problem, particularly trying to understand the role of the priors in this endeavour. What are the true priors AIs have? How do we know they are true? What are the implications of these priors?
                            I am currently visiting the University of Oxford to work on [Prover-Verifier Games](https://arxiv.org/abs/2407.13692) with [Alessandro Abate](https://www.cs.ox.ac.uk/people/alessandro.abate/). I am broadly interested in AI Alignment and Safety, Reinforcement Learning, Generalization and anything in between. If anything catches your eye, or if you have thoughts/ideas to share or if you'd like to work with me on something, don't hesitate to 
                            `)}
                            <Link 
                                href="/contact" 
                                className="relative inline-block font-medium text-neutral-900 dark:text-white after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-neutral-900 dark:after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
                            >
                            {renderTextWithLinks(`
                                contact me
                            `)}
                            </Link>.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}