'use client';

import { motion, useReducedMotion } from 'framer-motion';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

export function HeroReveal({ children, className }) {
    const shouldReduceMotion = useReducedMotion();
    if (shouldReduceMotion) return <div className={className}>{children}</div>;
    return (
        <motion.div variants={container} initial="hidden" animate="visible" className={className}>
            {children}
        </motion.div>
    );
}

export function HeroItem({ children, className }) {
    const shouldReduceMotion = useReducedMotion();
    if (shouldReduceMotion) return <div className={className}>{children}</div>;
    return <motion.div variants={item} className={className}>{children}</motion.div>;
}
