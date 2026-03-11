"use client";

import { type HTMLMotionProps, motion } from "framer-motion";

/**
 * A wrapper for buttons or interactive cards that scales to 1.02 on hover
 * and presses down to 0.98 on click. 0.2s duration.
 */
export default function AnimatedButton({
    children,
    className = "",
    ...props
}: HTMLMotionProps<"button">) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.button>
    );
}
