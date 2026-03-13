"use client";

import { Moon, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { submitAdminRequest } from "../../services/adminRequestService";

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function RequestAdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!reason.trim()) {
            setError("Please provide a reason for your request.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await submitAdminRequest(reason.trim());
            toast("Admin request submitted! You'll be notified once reviewed.", "success");
            setTimeout(() => router.push("/dashboard"), 1500);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to submit request.";
            setError(msg);
            toast(msg, "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <div className="section-container py-16">
                <div className="mx-auto max-w-lg">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                            <Moon className="h-7 w-7 text-primary-600" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            Request Admin Access
                        </h1>
                        <p className="mt-2 text-sm text-neutral-500">
                            Explain why you need admin privileges. Your request will be reviewed
                            by an existing administrator.
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="admin-reason"
                                    className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-600 uppercase"
                                >
                                    Reason for Request
                                </label>
                                <textarea
                                    id="admin-reason"
                                    rows={5}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Describe your role and why you need admin access…"
                                    className="input-field resize-none"
                                />
                                {error && (
                                    <p className="mt-1.5 text-xs text-red-600">{error}</p>
                                )}
                            </div>

                            {user ? (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-base"
                                >
                                    {loading ? <Spinner /> : <Send className="h-4 w-4" />}
                                    {loading ? "Submitting…" : "Submit Request"}
                                </button>
                            ) : (
                                <a
                                    href="/login"
                                    className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-base"
                                >
                                    Login to Submit
                                </a>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---- Spinner ---- */

function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}
