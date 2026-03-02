"use client";

import {
    AlertTriangle,
    CheckCircle,
    Clock,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getAllCampaigns,
    updateCampaignStatus,
} from "../../../../services/campaignService";
import type { Campaign, CampaignStatus } from "../../../../types/campaign";

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AdminCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

    // Confirmation modal state
    const [modal, setModal] = useState<{
        campaign: Campaign;
        action: "approved" | "rejected";
    } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        getAllCampaigns()
            .then(setCampaigns)
            .catch((err) => console.error("[AdminCampaigns]", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const stats = useMemo(() => {
        const pending = campaigns.filter((c) => c.status === "pending").length;
        const approved = campaigns.filter((c) => c.status === "approved").length;
        const rejected = campaigns.filter((c) => c.status === "rejected").length;
        return { pending, approved, rejected };
    }, [campaigns]);

    const pendingCampaigns = useMemo(
        () => campaigns.filter((c) => c.status === "pending"),
        [campaigns],
    );

    /* ---- Handle approve / reject ---- */
    async function handleConfirm() {
        if (!modal) return;
        setActionLoading(true);
        try {
            await updateCampaignStatus(modal.campaign.id, modal.action);
            setToast(
                modal.action === "approved"
                    ? `"${modal.campaign.title}" has been approved ✓`
                    : `"${modal.campaign.title}" has been rejected`,
            );
            setModal(null);
            load(); // refresh
            setTimeout(() => setToast(""), 3500);
        } catch (err) {
            console.error("[Admin] status update error:", err);
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="relative">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 animate-[fadeSlideDown_0.3s_ease-out] rounded-xl border border-primary-200 bg-white px-5 py-3 text-sm font-medium text-neutral-800 shadow-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary-600" />
                        {toast}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-6 w-6 text-primary-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                        Campaign Approvals
                    </h1>
                </div>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Review and approve campaigns submitted by NGOs.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <StatCard
                    icon={<Clock className="h-5 w-5 text-amber-600" />}
                    label="Pending"
                    value={stats.pending}
                    color="amber"
                />
                <StatCard
                    icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
                    label="Approved"
                    value={stats.approved}
                    color="emerald"
                />
                <StatCard
                    icon={<XCircle className="h-5 w-5 text-red-500" />}
                    label="Rejected"
                    value={stats.rejected}
                    color="red"
                />
            </div>

            {/* Table */}
            {loading ? (
                <SkeletonTable />
            ) : pendingCampaigns.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-neutral-800">
                        All caught up!
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-neutral-500">
                        No campaigns are pending review right now.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/80">
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                        Campaign
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                        Target
                                    </th>
                                    <th className="px-5 py-3.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                        Created
                                    </th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {pendingCampaigns.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="transition-colors hover:bg-neutral-50/60"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-neutral-900 line-clamp-1">
                                                {c.title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-neutral-400">
                                                {c.organization_name ?? "—"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-block rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                                                {c.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-medium text-neutral-800">
                                            {formatCurrency(c.target_amount)}
                                        </td>
                                        <td className="px-5 py-4 text-neutral-500">
                                            {new Date(c.created_at).toLocaleDateString("en-PK", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setModal({ campaign: c, action: "approved" })
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:shadow-sm"
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setModal({ campaign: c, action: "rejected" })
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:shadow-sm"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="animate-[fadeSlideDown_0.25s_ease-out] mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${modal.action === "approved"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                            >
                                {modal.action === "approved" ? (
                                    <CheckCircle className="h-5 w-5" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">
                                    {modal.action === "approved"
                                        ? "Approve Campaign?"
                                        : "Reject Campaign?"}
                                </h3>
                                <p className="mt-0.5 text-sm text-neutral-500">
                                    {modal.action === "approved"
                                        ? "This campaign will become visible to all donors."
                                        : "This campaign will be rejected and hidden from donors."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl bg-neutral-50 px-4 py-3">
                            <p className="text-sm font-semibold text-neutral-800">
                                {modal.campaign.title}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-400">
                                by {modal.campaign.organization_name ?? "Unknown"} ·{" "}
                                {formatCurrency(modal.campaign.target_amount)}
                            </p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                disabled={actionLoading}
                                className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={actionLoading}
                                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${modal.action === "approved"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {actionLoading
                                    ? "Processing…"
                                    : modal.action === "approved"
                                        ? "Yes, Approve"
                                        : "Yes, Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}) {
    const bgMap: Record<string, string> = {
        amber: "bg-amber-50",
        emerald: "bg-emerald-50",
        red: "bg-red-50",
    };
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgMap[color] ?? "bg-neutral-50"}`}
            >
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
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function SkeletonTable() {
    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 bg-neutral-50/80 px-5 py-3.5">
                <div className="h-3 w-24 rounded bg-neutral-200" />
            </div>
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="flex animate-pulse items-center gap-6 border-b border-neutral-50 px-5 py-4"
                >
                    <div className="h-4 w-40 rounded bg-neutral-100" />
                    <div className="h-4 w-20 rounded bg-neutral-100" />
                    <div className="h-4 w-24 rounded bg-neutral-100" />
                    <div className="h-4 w-20 rounded bg-neutral-100" />
                    <div className="ml-auto flex gap-2">
                        <div className="h-8 w-20 rounded-xl bg-neutral-100" />
                        <div className="h-8 w-20 rounded-xl bg-neutral-100" />
                    </div>
                </div>
            ))}
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
