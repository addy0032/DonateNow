"use client";

import { Moon, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CampaignCard from "../../components/CampaignCard";
import Navbar from "../../components/Navbar";
import { getApprovedCampaigns } from "../../services/campaignService";
import type { Campaign } from "../../types/campaign";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
    "All",
    "Education",
    "Healthcare",
    "Women Empowerment",
    "Environment",
    "Rural Development",
    "Zakaat",
    "Other",
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ExplorePage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [zakaatOnly, setZakaatOnly] = useState(false);

    // Fetch campaigns on mount.
    useEffect(() => {
        async function load() {
            try {
                const data = await getApprovedCampaigns();
                setCampaigns(data);
            } catch (err) {
                console.error("[Explore] fetch error:", err);
                setError("Failed to load campaigns. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Filtered results.
    const filtered = useMemo(() => {
        let result = campaigns;

        if (category !== "All") {
            result = result.filter((c) => c.category === category);
        }
        if (zakaatOnly) {
            result = result.filter((c) => c.is_zakaat);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.title.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q),
            );
        }

        return result;
    }, [campaigns, category, zakaatOnly, search]);

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            {/* Header */}
            <section className="border-b border-neutral-200 bg-white">
                <div className="section-container py-12 text-center">
                    <span className="mb-2 inline-block text-xs font-bold tracking-widest text-primary-600 uppercase">
                        Browse Campaigns
                    </span>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                        Explore Causes
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-neutral-500">
                        Find a cause that moves you and make a real difference in
                        someone&apos;s life today.
                    </p>
                </div>
            </section>

            {/* Filters + Grid */}
            <section className="section-container py-10">
                {/* ---- Filter Bar ---- */}
                <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search campaigns…"
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pr-9 pl-9 text-sm text-neutral-800 transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Category */}
                    <div className="relative">
                        <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="appearance-none rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pr-10 pl-9 text-sm text-neutral-700 transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Zakaat toggle */}
                    <button
                        type="button"
                        onClick={() => setZakaatOnly((p) => !p)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${zakaatOnly
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                            }`}
                    >
                        <Moon className="h-4 w-4" />
                        Zakaat Only
                    </button>
                </div>

                {/* ---- Content ---- */}
                {loading ? (
                    <SkeletonGrid />
                ) : error ? (
                    <div className="py-20 text-center">
                        <p className="text-sm text-danger">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState hasFilters={search !== "" || category !== "All" || zakaatOnly} />
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((campaign) => (
                            <CampaignCard
                                key={campaign.id}
                                id={campaign.id}
                                title={campaign.title}
                                description={campaign.description}
                                image_url={campaign.image_url}
                                current_amount={campaign.current_amount}
                                target_amount={campaign.target_amount}
                                category={campaign.category ?? "Other"}
                                is_zakaat={campaign.is_zakaat ?? false}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Skeleton Grid                                                     */
/* ------------------------------------------------------------------ */

function SkeletonGrid() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm"
                >
                    <div className="h-48 bg-neutral-100" />
                    <div className="space-y-3 p-5">
                        <div className="h-4 w-3/4 rounded bg-neutral-100" />
                        <div className="h-3 w-full rounded bg-neutral-100" />
                        <div className="h-3 w-5/6 rounded bg-neutral-100" />
                        <div className="mt-4 h-2 w-full rounded-full bg-neutral-100" />
                        <div className="flex justify-between">
                            <div className="h-3 w-16 rounded bg-neutral-100" />
                            <div className="h-3 w-12 rounded bg-neutral-100" />
                        </div>
                        <div className="mt-2 h-10 w-full rounded-xl bg-neutral-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                       */
/* ------------------------------------------------------------------ */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <div className="flex flex-col items-center py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100">
                <Search className="h-8 w-8 text-neutral-300" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-neutral-800">
                {hasFilters ? "No matching campaigns" : "No campaigns yet"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-neutral-500">
                {hasFilters
                    ? "Try adjusting your filters or search query to find what you're looking for."
                    : "There are no approved campaigns at the moment. Check back soon!"}
            </p>
        </div>
    );
}
