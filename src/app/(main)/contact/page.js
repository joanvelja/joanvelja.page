import Link from 'next/link';
import { Mail, GraduationCap, FileText, ArrowRight } from 'lucide-react';
import { HeroReveal, HeroItem } from '@/components/HeroReveal';
import { ScrollReveal } from '@/components/ScrollReveal';

export const metadata = {
    title: 'Contact | Joan Velja',
    description: 'Get in touch with Joan Velja.'
};

const GITHUB_ICON_PATH = 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12';

const XIcon = (props) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z" />
    </svg>
);

const GitHubIcon = (props) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d={GITHUB_ICON_PATH} />
    </svg>
);

const LessWrongIcon = ({ className = "", size = 24 }) => (
    <img
      src="/png/Lesswrong.png"
      alt="LessWrong"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }}
    />
);

const SOCIAL_LINKS = [
    { label: 'X', href: 'https://x.com/joanvelja', icon: XIcon, hoverColor: 'group-hover:text-sky-500' },
    { label: 'GitHub', href: '#', icon: GitHubIcon, hoverColor: 'group-hover:text-violet-500' },
    { label: 'Email', href: 'mailto:joan.velja22@gmail.com', icon: Mail, hoverColor: 'group-hover:text-emerald-500', external: false },
    { label: 'Scholar', href: 'https://scholar.google.com/citations?user=9WJ1rYkAAAAJ&hl=en', icon: GraduationCap, hoverColor: 'group-hover:text-oxford-500' },
    { label: 'LessWrong', href: 'https://www.lesswrong.com/users/joanv', icon: LessWrongIcon, hoverColor: 'group-hover:text-orange-500', iconProps: { size: 36 } },
    { label: 'CV', href: '/pdf/CV_extended_Velja.pdf', icon: FileText, hoverColor: 'group-hover:text-red-500', internal: true },
];

const ICON_CLASS = 'w-9 h-9 text-neutral-700 dark:text-neutral-200 transition-colors duration-200';

export default function ContactPage() {
    return (
        <main className="flex flex-col items-center justify-start w-full">
            <section className="w-full max-w-[540px] space-y-12 px-4 py-16">
                <HeroReveal className="space-y-6">
                    <HeroItem>
                        <h1 className="text-3xl md:text-display font-serif-display font-medium text-neutral-900 dark:text-white">
                            Contact
                        </h1>
                    </HeroItem>
                    <HeroItem>
                        <a
                            href="https://calendar.app.google/4SE9NkamgzSWytEXA"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 px-6 py-3 bg-oxford-800 text-white dark:bg-oxford-100 dark:text-oxford-900 rounded-full font-sans font-medium hover:bg-oxford-700 dark:hover:bg-oxford-200 transition-colors duration-200"
                        >
                            Schedule a call
                            <ArrowRight size={16} />
                        </a>
                    </HeroItem>
                </HeroReveal>

                <ScrollReveal>
                    <div className="flex items-start justify-center gap-10">
                        {SOCIAL_LINKS.map(({ label, href, icon: Icon, hoverColor, iconProps, internal }) => {
                            const Wrapper = internal ? Link : 'a';
                            const linkProps = internal
                                ? { href }
                                : { href, target: '_blank', rel: 'noopener noreferrer' };
                            return (
                                <Wrapper key={label} {...linkProps} className="group flex flex-col items-center gap-1.5">
                                    <Icon className={`${ICON_CLASS} ${hoverColor}`} {...iconProps} />
                                    <span className="text-xs font-sans text-neutral-400 dark:text-neutral-500">{label}</span>
                                </Wrapper>
                            );
                        })}
                    </div>
                </ScrollReveal>
            </section>
        </main>
    );
}
