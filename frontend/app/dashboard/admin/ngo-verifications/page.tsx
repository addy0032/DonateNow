"use client";

import { useCallback, useEffect, useState } from "react";
import {
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    Shield,
    XCircle,
} from "lucide-react";
import {
    getAllPendingVerifications,
    updateDocumentStatus,
    setNgoVerified,
    getDocumentSignedUrl,
    type NgoVerificationRow,
    type DocumentStatus,
} from "../../../../services/ngoVerificationService";
import AnimatedSection from "../../../../components/AnimatedSection";
import EmptyState from "../../../../components/EmptyState";
import { useToast } from "../../../../components/Toast";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const DOC_LABELS: Record<string, string> = {
    registration_certificate: "Registration Certificate",
    tax_exemption: "Tax Exemption",
    identity_proof: "Identity Proof",
};

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700" },
    approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700" },
    rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AdminNgoVerificationsPage() {
    const [documents, setDocuments] = useState<NgoVerificationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Confirmation modal
    const [modal, setModal] = useState<{
        doc: NgoVerificationRow;
        action: "approved" | "rejected";
    } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        getAllPendingVerifications()
            .then(setDocuments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    /* ---- Download document ---- */
    async function handleDownload(path: string) {
        try {
            const url = await getDocumentSignedUrl(path);
            window.open(url, "_blank");
        } catch (err) {
            toast("Failed to generate download link.", "error");
        }
    }

    /* ---- Approve / Reject ---- */
    async function handleConfirm() {
        if (!modal) return;
        setActionLoading(true);
        try {
            await updateDocumentStatus(modal.doc.id, modal.action);

            if (modal.action === "approved") {
                // Check if ALL documents for this user are now approved
                const userDocs = documents.filter((d) => d.user_id === modal.doc.user_id);
                const othersApproved = userDocs
                    .filter((d) => d.id !== modal.doc.id)
                    .every((d) => d.status === "approved");

                if (othersApproved) {
                    await setNgoVerified(modal.doc.user_id, true);
                    toast(
                        `All documents approved! ${modal.doc.organization_name} is now verified.`,
                        "success",
                    );
                } else {
                    toast(`Document approved for ${modal.doc.organization_name}.`, "success");
                }
            } else {
                toast(`Document rejected for ${modal.doc.organization_name}.`, "info");
            }

            setModal(null);
            load();
        } catch (err) {
            toast("Failed to process document.", "error");
        } finally {
            setActionLoading(false);
        }
    }

    // Group documents by user for display
    const grouped = documents.reduce<Record<string, NgoVerificationRow[]>>((acc, doc) => {
        if (!acc[doc.user_id]) acc[doc.user_id] = [];
        acc[doc.user_id].push(doc);
        return acc;
    }, {});

    const pendingCount = documents.filter((d) => d.status === "pending").length;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5">
                    <Shield className="h-6 w-6 text-primary-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                        NGO Verifications
                    </h1>
                </div>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Review uploaded documents and verify NGO organizations.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-6 flex gap-4">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-sm">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-neutral-700">
                        {pendingCount} Pending
                    </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-sm">
                    <FileText className="h-4 w-4 text-neutral-500" />
                    <span className="font-medium text-neutral-700">
                        {documents.length} Total Documents
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-40 animate-pulse rounded-2xl bg-neutral-100" />
                    ))}
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <EmptyState
                    icon={<Shield className="h-8 w-8" />}
                    title="No documents submitted"
                    description="NGOs will appear here once they submit verification documents."
                />
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([userId, docs]) => {
                        const first = docs[0];
                        const allApproved = docs.every((d) => d.status === "approved");
                        return (
                            <AnimatedSection
                                key={userId}
                                className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
                            >
                                {/* NGO Header */}
                                <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-5 py-3.5">
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">
                                            {first.organization_name}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {first.full_name} · {first.email}
                                        </p>
                                    </div>
                                    {allApproved && (
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 uppercase">
                                            <CheckCircle className="h-3 w-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>

                                {/* Documents table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-neutral-100 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                                <th className="px-5 py-2.5">Document</th>
                                                <th className="px-5 py-2.5">File</th>
                                                <th className="px-5 py-2.5">Date</th>
                                                <th className="px-5 py-2.5">Status</th>
                                                <th className="px-5 py-2.5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {docs.map((doc) => {
                                                const s = STATUS_STYLES[doc.status] ?? STATUS_STYLES.pending;
                                                return (
                                                    <tr
                                                        key={doc.id}
                                                        className="border-b border-neutral-50 transition hover:bg-neutral-50/60"
                                                    >
                                                        <td className="px-5 py-3 font-medium text-neutral-800">
                                                            {DOC_LABELS[doc.document_type] ?? doc.document_type}
                                                        </td>
                                                        <td className="px-5 py-3 text-xs text-neutral-500 max-w-[150px] truncate">
                                                            {doc.document_path.split("/").pop()}
                                                        </td>
                                                        <td className="px-5 py-3 text-neutral-500">
                                                            {new Date(doc.created_at).toLocaleDateString("en-PK", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase ${s.bg} ${s.text}`}>
                                                                {s.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDownload(doc.document_path)}
                                                                    className="rounded-lg bg-neutral-100 p-1.5 text-neutral-600 transition hover:bg-neutral-200"
                                                                    title="View document"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </button>
                                                                {doc.status === "pending" && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setModal({ doc, action: "approved" })
                                                                            }
                                                                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setModal({ doc, action: "rejected" })
                                                                            }
                                                                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </AnimatedSection>
                        );
                    })}
                </div>
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
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-neutral-900">
                                {modal.action === "approved"
                                    ? "Approve Document"
                                    : "Reject Document"}
                            </h3>
                        </div>

                        <p className="mb-6 text-sm text-neutral-600">
                            {modal.action === "approved"
                                ? `Approve the ${DOC_LABELS[modal.doc.document_type]} from "${modal.doc.organization_name}"?`
                                : `Reject the ${DOC_LABELS[modal.doc.document_type]} from "${modal.doc.organization_name}"?`}
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
