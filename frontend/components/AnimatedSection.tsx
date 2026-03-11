"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    id?: string;
    /** Whether this is a span, div, or section. Defaults to section. */
    as?: "section" | "div" | "article" | "h1" | "h2" | "h3" | "span" | "p";
}

/**
 * A reusable wrapper that fades in and slightly moves up when it scrolls into view.
 * Triggers only once. Smooth 0.4s transition.
 */
export default function AnimatedSection({
    children,
    className = "",
    delay = 0,
    id,
    as = "section",
}: AnimatedSectionProps) {
    const Component = motion[as];

    return (
        <Component
            id={id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: delay,
            }}
            className={className}
        >
            {children}
        </Component>
    );
}
