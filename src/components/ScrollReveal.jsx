'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

export function ScrollReveal({ children, className, delay = 0 }) {
    const shouldReduceMotion = useReducedMotion();
    if (shouldReduceMotion) return <div className={className}>{children}</div>;

    return (
        <LazyMotion features={domAnimation}>
            <m.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
                className={className}
            >
                {children}
            </m.div>
        </LazyMotion>
    );
}
