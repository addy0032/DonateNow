import { Heart, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CampaignCardProps {
    /** Campaign ID for the detail link. */
    id: string;
    title: string;
    description: string;
    /** URL of the cover image. Falls back to a gradient placeholder. */
    image_url?: string | null;
    /** Amount raised so far. */
    current_amount: number;
    /** Total fundraising target. */
    target_amount: number;
    /** Display category — e.g. "Education", "Healthcare". */
    category: string;
    /** Whether this campaign is Zakaat-eligible. */
    is_zakaat?: boolean;
}

import AnimatedSection from "./AnimatedSection";

export default function CampaignCard({
    id,
    title,
    description,
    image_url,
    current_amount,
    target_amount,
    category,
    is_zakaat = false,
}: CampaignCardProps) {
    const progress = target_amount > 0
        ? Math.min((current_amount / target_amount) * 100, 100)
        : 0;

    const raised = formatCurrency(current_amount);
    const goal = formatCurrency(target_amount);

    return (
        <AnimatedSection as="div" className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            {/* ---- Image ---- */}
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
                {image_url ? (
                    <Image
                        src={image_url}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Heart className="h-12 w-12 text-primary-300/60" strokeWidth={1.5} />
                    </div>
                )}

                {/* Category badge */}
                <span className="absolute top-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-neutral-700 uppercase shadow-sm backdrop-blur-sm">
                    {category}
                </span>

                {/* Zakaat badge */}
                {is_zakaat && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg bg-teal-600/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm backdrop-blur-sm">
                        <Moon className="h-3 w-3" />
                        Zakaat Eligible
                    </span>
                )}
            </div>

            {/* ---- Content ---- */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold leading-snug text-neutral-900 line-clamp-1">
                    {title}
                </h3>

                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 line-clamp-2">
                    {description}
                </p>

                {/* ---- Progress bar ---- */}
                <div className="mt-auto pt-5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-sm font-bold text-primary-600">
                            {raised}
                        </span>
                        <span className="text-xs text-neutral-400">
                            of {goal}
                        </span>
                    </div>
                </div>

                {/* ---- Donate button ---- */}
                <Link
                    href={`/campaigns/${id}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-700 hover:shadow-md active:scale-[0.98]"
                >
                    <Heart className="h-4 w-4" />
                    Donate Now
                </Link>
            </div>
        </AnimatedSection>
    );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
    }).format(amount);
}
