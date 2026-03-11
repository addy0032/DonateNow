"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

/**
 * Triggers a subtle fade-in every time the route changes.
 * Next.js automatically creates a new instance of `template.tsx` on navigation.
 */
export default function Template({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-h-screen"
        >
            {children}
        </motion.div>
    );
}
