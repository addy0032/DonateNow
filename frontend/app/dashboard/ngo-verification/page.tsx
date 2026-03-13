"use client";

import { useCallback, useEffect, useState } from "react";
import {
    CheckCircle,
    Clock,
    FileText,
    Shield,
    Upload,
    X,
    XCircle,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";
import {
    uploadNgoDocument,
    saveDocumentMetadata,
    getMyDocuments,
    type NgoDocument,
    type DocumentType,
} from "../../../services/ngoVerificationService";

/* ------------------------------------------------------------------ */
/*  Document types                                                    */
/* ------------------------------------------------------------------ */

const DOC_TYPES: { key: DocumentType; label: string; description: string }[] = [
    {
        key: "registration_certificate",
        label: "Registration Certificate",
        description: "NGO / Society registration certificate",
    },
    {
        key: "tax_exemption",
        label: "Tax Exemption Document",
        description: "Section 2(36) / tax exemption certificate",
    },
    {
        key: "identity_proof",
        label: "Identity Proof",
        description: "CNIC / passport of the authorized signatory",
    },
];

const STATUS_STYLES: Record<string, { icon: React.ReactNode; label: string; class: string }> = {
    pending: {
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "Pending",
        class: "bg-amber-100 text-amber-700",
    },
    approved: {
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        label: "Approved",
        class: "bg-emerald-100 text-emerald-700",
    },
    rejected: {
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: "Rejected",
        class: "bg-red-100 text-red-700",
    },
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function NgoVerificationPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [documents, setDocuments] = useState<NgoDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<DocumentType | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        getMyDocuments()
            .then(setDocuments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    function getDocStatus(type: DocumentType): NgoDocument | undefined {
        return documents.find((d) => d.document_type === type);
    }

    async function handleUpload(file: File, docType: DocumentType) {
        if (!user) return;
        setUploading(docType);
        try {
            const path = await uploadNgoDocument(file, user.id, docType);
            await saveDocumentMetadata(user.id, docType, path);
            toast(`${DOC_TYPES.find((d) => d.key === docType)?.label} uploaded!`, "success");
            load();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Upload failed.";
            toast(msg, "error");
        } finally {
            setUploading(null);
        }
    }

    const allUploaded = DOC_TYPES.every((dt) => getDocStatus(dt.key));
    const allApproved = DOC_TYPES.every((dt) => getDocStatus(dt.key)?.status === "approved");

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5">
                    <Shield className="h-6 w-6 text-primary-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                        NGO Verification
                    </h1>
                </div>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Upload your documents to verify your organization and start creating campaigns.
                </p>
            </div>

            {/* Verification status banner */}
            {allApproved && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-emerald-800">
                            Your organization is verified ✓
                        </p>
                        <p className="text-xs text-emerald-600">
                            You can now create campaigns on DonateNow.
                        </p>
                    </div>
                </div>
            )}

            {/* Document upload cards */}
            <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
                {DOC_TYPES.map((dt) => {
                    const existing = getDocStatus(dt.key);
                    const isUploading = uploading === dt.key;
                    const status = existing ? STATUS_STYLES[existing.status] : null;

                    return (
                        <div
                            key={dt.key}
                            className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                        >
                            {/* Icon & label */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                                    <FileText className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">
                                        {dt.label}
                                    </h3>
                                    <p className="text-xs text-neutral-400">{dt.description}</p>
                                </div>
                            </div>

                            {/* Status or upload */}
                            {existing ? (
                                <div className="mt-auto">
                                    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase ${status?.class}`}>
                                        {status?.icon}
                                        {status?.label}
                                    </div>
                                    <p className="mt-2 text-[11px] text-neutral-400 truncate">
                                        {existing.document_path.split("/").pop()}
                                    </p>
                                    {existing.status === "rejected" && (
                                        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100">
                                            <Upload className="h-3.5 w-3.5" />
                                            Re-upload
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUpload(file, dt.key);
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            ) : (
                                <label
                                    className={`mt-auto flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all ${isUploading
                                            ? "border-primary-300 bg-primary-50"
                                            : "border-neutral-300 bg-neutral-50/60 hover:border-primary-300 hover:bg-neutral-50"
                                        }`}
                                >
                                    {isUploading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                                    ) : (
                                        <Upload className="h-5 w-5 text-neutral-400" />
                                    )}
                                    <span className="text-xs font-medium text-neutral-600">
                                        {isUploading ? "Uploading…" : "Click to upload"}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                        PDF, JPG, or PNG
                                    </span>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        disabled={isUploading}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUpload(file, dt.key);
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress summary */}
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-neutral-800">
                    Verification Progress
                </h3>
                <div className="space-y-2.5">
                    {DOC_TYPES.map((dt) => {
                        const existing = getDocStatus(dt.key);
                        return (
                            <div key={dt.key} className="flex items-center gap-3 text-sm">
                                {existing ? (
                                    existing.status === "approved" ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    ) : existing.status === "rejected" ? (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-amber-500" />
                                    )
                                ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-neutral-300" />
                                )}
                                <span
                                    className={
                                        existing?.status === "approved"
                                            ? "text-neutral-800 font-medium"
                                            : "text-neutral-500"
                                    }
                                >
                                    {dt.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
