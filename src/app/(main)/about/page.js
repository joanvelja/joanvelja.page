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
            <section className="w-full max-w-[540px] px-4 py-16 flex flex-col">
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

                {/* Scrollable Content Section */}
                <div className="overflow-y-auto max-h-[500px] pr-4 space-y-6 text-neutral-800 dark:text-neutral-200 
                    [&::-webkit-scrollbar]:w-2 
                    [&::-webkit-scrollbar-track]:bg-neutral-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-800
                    [&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600
                    [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
                    {/* Greeting */}
                    <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <h1 className="text-2xl font-medium text-center">
                            Hi! I'm Joan.
                        </h1>
                    </div>

                    {/* Main Text */}
                    <div className="space-y-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
                        <p className="text-lg leading-relaxed">
                            {renderTextWithLinks(`
                            If you stumbled upon this page, you might have a lot in common with me. I am a second-year MSc student in Artificial Intelligence at the University of Amsterdam, currently visiting the University of Oxford to work on [Prover-Verifier Games](https://arxiv.org/abs/2407.13692). I am broadly interested in AI Alignment, Reinforcement Learning, AI Control and LLM post-training. If anything catches your eye, or if you have thoughts/ideas to share or if you'd like to work with me on something, don't hesitate to 
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