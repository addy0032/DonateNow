"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}

/**
 * A reusable empty-state card with an icon, copy, and optional CTA.
 * Centered layout with soft neutral styling.
 */
export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <AnimatedSection
            as="div"
            className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 bg-white/60 py-16 text-center"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                {icon}
            </div>
            <h3 className="mt-5 text-lg font-bold text-neutral-800">{title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Link href={actionHref} className="btn-primary mt-6 text-sm">
                    {actionLabel}
                </Link>
            )}
        </AnimatedSection>
    );
}
