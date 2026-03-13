"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import {
    getAllAdminRequests,
    updateAdminRequestStatus,
    promoteToAdmin,
    type AdminRequest,
} from "../../../../services/adminRequestService";
import AnimatedSection from "../../../../components/AnimatedSection";
import EmptyState from "../../../../components/EmptyState";
import { useToast } from "../../../../components/Toast";

/* ------------------------------------------------------------------ */
/*  Status styles                                                     */
/* ------------------------------------------------------------------ */

const STATUS: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
    approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700" },
    rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<AdminRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Confirmation modal state
    const [modal, setModal] = useState<{
        request: AdminRequest;
        action: "approved" | "rejected";
    } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        getAllAdminRequests()
            .then(setRequests)
            .catch((err) => console.error("[AdminRequests]", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    /* ---- Confirm action ---- */
    async function handleConfirm() {
        if (!modal) return;
        setActionLoading(true);
        try {
            await updateAdminRequestStatus(modal.request.id, modal.action);

            if (modal.action === "approved") {
                await promoteToAdmin(modal.request.user_id);
                toast(`${modal.request.full_name} has been promoted to Admin ✓`, "success");
            } else {
                toast(`Request from ${modal.request.full_name} has been rejected`, "info");
            }

            setModal(null);
            load();
        } catch (err) {
            console.error("[AdminRequests] action error:", err);
            toast("Failed to process request.", "error");
        } finally {
            setActionLoading(false);
        }
    }

    const pendingRequests = requests.filter((r) => r.status === "pending");

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-6 w-6 text-primary-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                        Admin Requests
                    </h1>
                </div>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Review and manage requests for admin access.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-6 flex gap-4">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-sm">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-neutral-700">
                        {pendingRequests.length} Pending
                    </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-neutral-700">
                        {requests.filter((r) => r.status === "approved").length} Approved
                    </span>
                </div>
            </div>

            {/* Table or Empty */}
            {loading ? (
                <SkeletonTable />
            ) : requests.length === 0 ? (
                <EmptyState
                    icon={<ShieldCheck className="h-8 w-8" />}
                    title="No admin requests"
                    description="When users request admin access, their requests will appear here."
                />
            ) : (
                <AnimatedSection className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                    <th className="px-5 py-3">User</th>
                                    <th className="px-5 py-3">Email</th>
                                    <th className="px-5 py-3">Reason</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((r) => {
                                    const s = STATUS[r.status] ?? STATUS.pending;
                                    return (
                                        <tr
                                            key={r.id}
                                            className="border-b border-neutral-50 transition hover:bg-neutral-50/60"
                                        >
                                            <td className="px-5 py-3.5 font-medium text-neutral-800">
                                                {r.full_name}
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-500">
                                                {r.email}
                                            </td>
                                            <td className="max-w-[200px] truncate px-5 py-3.5 text-neutral-600">
                                                {r.reason}
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-500">
                                                {new Date(r.created_at).toLocaleDateString("en-PK", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase ${s.bg} ${s.text}`}
                                                >
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                {r.status === "pending" && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setModal({ request: r, action: "approved" })
                                                            }
                                                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setModal({ request: r, action: "rejected" })
                                                            }
                                                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </AnimatedSection>
            )}

            {/* Confirmation Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
                        <div className="mb-5 flex items-center gap-3">
                            {modal.action === "approved" ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-neutral-900">
                                {modal.action === "approved" ? "Approve Request" : "Reject Request"}
                            </h3>
                        </div>

                        <p className="mb-6 text-sm text-neutral-600">
                            {modal.action === "approved"
                                ? `Promote "${modal.request.full_name}" to Admin? They will gain full admin access.`
                                : `Reject the request from "${modal.request.full_name}"?`}
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                disabled={actionLoading}
                                className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={actionLoading}
                                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition ${modal.action === "approved"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {actionLoading
                                    ? "Processing…"
                                    : modal.action === "approved"
                                        ? "Approve"
                                        : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function SkeletonTable() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-100" />
            ))}
        </div>
    );
}
