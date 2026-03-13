"use client";

import {
    BarChart3,
    Clock,
    Heart,
    PlusCircle,
    TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMyCampaigns } from "../../../services/campaignService";
import type { Campaign, CampaignStatus } from "../../../types/campaign";
import AnimatedSection from "../../../components/AnimatedSection";
import EmptyState from "../../../components/EmptyState";
import { getCampaignImageUrl } from "../../../lib/storage";

/* ------------------------------------------------------------------ */
/*  Status badge config                                               */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<CampaignStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
    approved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Approved" },
    rejected: { bg: "bg-red-50", text: "text-red-600", label: "Rejected" },
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function MyCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyCampaigns()
            .then(setCampaigns)
            .catch((err) => console.error("[MyCampaigns]", err))
            .finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        const total = campaigns.length;
        const pending = campaigns.filter((c) => c.status === "pending").length;
        const totalRaised = campaigns.reduce((sum, c) => sum + (c.current_amount ?? 0), 0);
        return { total, pending, totalRaised };
    }, [campaigns]);

    if (loading) return <SkeletonPage />;

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                        My Campaigns
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage your fundraising campaigns and track progress.
                    </p>
                </div>
                <Link
                    href="/dashboard/create-campaign"
                    className="btn-primary inline-flex items-center gap-2 py-2.5 text-sm"
                >
                    <PlusCircle className="h-4 w-4" />
                    New Campaign
                </Link>
            </div>

            {/* Analytics cards */}
            <AnimatedSection className="mb-8 grid gap-4 sm:grid-cols-3">
                <StatCard
                    icon={<BarChart3 className="h-5 w-5 text-primary-600" />}
                    label="Total Campaigns"
                    value={String(stats.total)}
                />
                <StatCard
                    icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
                    label="Total Raised"
                    value={formatCurrency(stats.totalRaised)}
                />
                <StatCard
                    icon={<Clock className="h-5 w-5 text-amber-600" />}
                    label="Pending Review"
                    value={String(stats.pending)}
                />
            </AnimatedSection>

            {campaigns.length === 0 ? (
                <EmptyState
                    icon={<PlusCircle className="h-8 w-8" />}
                    title="No campaigns yet"
                    description="Start making a difference — create your first campaign and reach donors who care."
                    actionLabel="Create Campaign"
                    actionHref="/dashboard/create-campaign"
                />
            ) : (
                <AnimatedSection className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => (
                        <CampaignCardWithStatus key={campaign.id} campaign={campaign} />
                    ))}
                </AnimatedSection>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Campaign card with status badge                                   */
/* ------------------------------------------------------------------ */

function CampaignCardWithStatus({ campaign }: { campaign: Campaign }) {
    const progress =
        campaign.target_amount > 0
            ? Math.min((campaign.current_amount / campaign.target_amount) * 100, 100)
            : 0;

    const status = STATUS_STYLES[campaign.status] ?? STATUS_STYLES.pending;

    const resolvedImage = campaign.image_url
        ? campaign.image_url.startsWith("http")
            ? campaign.image_url
            : getCampaignImageUrl(campaign.image_url)
        : null;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            {/* Image */}
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
                {resolvedImage ? (
                    <Image
                        src={resolvedImage}
                        alt={campaign.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Heart className="h-10 w-10 text-primary-300/60" strokeWidth={1.5} />
                    </div>
                )}

                {/* Status badge */}
                <span
                    className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase shadow-sm backdrop-blur-sm ${status.bg} ${status.text}`}
                >
                    {status.label}
                </span>

                {/* Category badge */}
                <span className="absolute top-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-neutral-700 uppercase shadow-sm backdrop-blur-sm">
                    {campaign.category}
                </span>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold leading-snug text-neutral-900 line-clamp-1">
                    {campaign.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 line-clamp-2">
                    {campaign.description}
                </p>

                {/* Progress bar */}
                <div className="mt-auto pt-5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-sm font-bold text-primary-600">
                            {formatCurrency(campaign.current_amount)}
                        </span>
                        <span className="text-xs text-neutral-400">
                            of {formatCurrency(campaign.target_amount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                         */
/* ------------------------------------------------------------------ */

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50">
                {icon}
            </div>
            <div>
                <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                    {label}
                </p>
                <p className="mt-0.5 text-lg font-bold text-neutral-900">{value}</p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function SkeletonPage() {
    return (
        <div>
            <div className="mb-8 h-8 w-48 animate-pulse rounded bg-neutral-100" />
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-20 animate-pulse rounded-2xl border border-neutral-200 bg-white"
                    />
                ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                    >
                        <div className="h-40 bg-neutral-100" />
                        <div className="space-y-3 p-5">
                            <div className="h-4 w-3/4 rounded bg-neutral-100" />
                            <div className="h-3 w-full rounded bg-neutral-100" />
                            <div className="h-2 w-full rounded-full bg-neutral-100" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
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
