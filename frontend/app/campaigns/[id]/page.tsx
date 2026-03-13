"use client";

import { ArrowLeft, Calendar, Heart, Moon, Share2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DonationModal from "../../../components/DonationModal";
import Navbar from "../../../components/Navbar";
import { getCampaignById } from "../../../services/campaignService";
import { getDonationsByCampaign } from "../../../services/donationService";
import { getCampaignImageUrl } from "../../../lib/storage";
import type { Campaign } from "../../../types/campaign";
import type { Donation } from "../../../types/donation";

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function CampaignDetailPage() {
    const params = useParams();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const load = useCallback(async () => {
        try {
            const [c, d] = await Promise.all([
                getCampaignById(campaignId),
                getDonationsByCampaign(campaignId),
            ]);
            setCampaign(c);
            setDonations(d);
        } catch (err) {
            console.error("[CampaignDetail]", err);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) return <SkeletonPage />;
    if (!campaign) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Navbar />
                <div className="section-container py-20 text-center">
                    <p className="text-neutral-500">Campaign not found.</p>
                    <Link href="/explore" className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:underline">
                        ← Back to Explore
                    </Link>
                </div>
            </div>
        );
    }

    const progress =
        campaign.target_amount > 0
            ? Math.min((campaign.current_amount / campaign.target_amount) * 100, 100)
            : 0;

    const donorCount = donations.length;

    // Resolve storage path to public URL if needed
    const resolvedImage = campaign.image_url
        ? campaign.image_url.startsWith("http")
            ? campaign.image_url
            : getCampaignImageUrl(campaign.image_url)
        : null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <div className="section-container py-10">
                {/* Back link */}
                <Link
                    href="/explore"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Explore
                </Link>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* ---- Left: Campaign Details ---- */}
                    <div className="lg:col-span-2">
                        {/* Image */}
                        <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 sm:h-80">
                            {resolvedImage ? (
                                <Image
                                    src={resolvedImage}
                                    alt={campaign.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 66vw"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <Heart className="h-16 w-16 text-primary-300/60" strokeWidth={1.5} />
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-neutral-700 uppercase shadow-sm backdrop-blur-sm">
                                    {campaign.category}
                                </span>
                                {campaign.is_zakaat && (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-teal-600/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm backdrop-blur-sm">
                                        <Moon className="h-3 w-3" />
                                        Zakaat Eligible
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Title & Org */}
                        <div className="mt-6">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                                {campaign.title}
                            </h1>
                            {campaign.organization_name && (
                                <p className="mt-1.5 text-sm text-neutral-400">
                                    by{" "}
                                    <span className="font-medium text-neutral-600">
                                        {campaign.organization_name}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                            {campaign.description}
                        </div>

                        {/* Meta */}
                        <div className="mt-8 flex flex-wrap gap-6 text-sm text-neutral-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                Created{" "}
                                {new Date(campaign.created_at).toLocaleDateString("en-PK", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                {donorCount} donor{donorCount !== 1 ? "s" : ""}
                            </div>
                        </div>

                        {/* Recent Donations */}
                        {donations.length > 0 && (
                            <div className="mt-10">
                                <h3 className="mb-4 text-sm font-bold tracking-wide text-neutral-800 uppercase">
                                    Recent Donations
                                </h3>
                                <div className="space-y-3">
                                    {donations.slice(0, 8).map((d) => (
                                        <div
                                            key={d.id}
                                            className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-800">
                                                    {d.is_anonymous ? "Anonymous Donor" : "A Generous Donor"}
                                                </p>
                                                {d.message && (
                                                    <p className="mt-0.5 text-xs text-neutral-400 line-clamp-1">
                                                        &quot;{d.message}&quot;
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-sm font-bold text-primary-600">
                                                {formatCurrency(d.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ---- Right: Donation Sidebar ---- */}
                    <div>
                        <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                            {/* Progress */}
                            <div className="mb-5">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold text-primary-600">
                                        {formatCurrency(campaign.current_amount)}
                                    </span>
                                    <span className="text-sm text-neutral-400">
                                        of {formatCurrency(campaign.target_amount)}
                                    </span>
                                </div>
                                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-neutral-400">
                                    {Math.round(progress)}% funded · {donorCount} donor{donorCount !== 1 ? "s" : ""}
                                </p>
                            </div>

                            {/* Donate button */}
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-primary-700 hover:shadow-md active:scale-[0.98]"
                            >
                                <Heart className="h-5 w-5" />
                                Donate Now
                            </button>

                            {/* Share */}
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                }}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100"
                            >
                                <Share2 className="h-4 w-4" />
                                Share Campaign
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Donation Modal */}
            {showModal && (
                <DonationModal
                    campaignId={campaign.id}
                    campaignTitle={campaign.title}
                    targetAmount={campaign.target_amount}
                    currentAmount={campaign.current_amount}
                    isZakaat={campaign.is_zakaat}
                    onSuccess={load}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function SkeletonPage() {
    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />
            <div className="section-container py-10">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
                        <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-100" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
                        <div className="space-y-2">
                            <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                            <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
                            <div className="h-3 w-4/6 animate-pulse rounded bg-neutral-100" />
                        </div>
                    </div>
                    <div>
                        <div className="h-52 animate-pulse rounded-2xl bg-neutral-100" />
                    </div>
                </div>
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
