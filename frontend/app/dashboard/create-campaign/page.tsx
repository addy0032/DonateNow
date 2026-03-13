"use client";

import { AlertTriangle, CheckCircle, Moon, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useCallback } from "react";
import { createCampaign } from "../../../services/campaignService";
import { uploadCampaignImage } from "../../../lib/storage";
import { supabase } from "../../../lib/supabaseClient";
import ImageUpload from "../../../components/ImageUpload";
import { useToast } from "../../../components/Toast";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
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

export default function CreateCampaignPage() {
    const router = useRouter();
    const { toast } = useToast();

    /* ---- Verification gate ---- */
    const [verified, setVerified] = useState<boolean | null>(null); // null = loading

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setVerified(false); return; }
            const { data } = await supabase
                .from("profiles")
                .select("ngo_verified")
                .eq("id", user.id)
                .single();
            setVerified(data?.ngo_verified === true);
        })();
    }, []);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [targetAmount, setTargetAmount] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [isZakaat, setIsZakaat] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    /* ---- Verification gate UI ---- */
    if (verified === null) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            </div>
        );
    }

    if (verified === false) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="mx-4 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                        <AlertTriangle className="h-7 w-7 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900">
                        Verification Required
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Your organization must be verified before you can create campaigns.
                        Please upload your verification documents first.
                    </p>
                    <Link
                        href="/dashboard/ngo-verification"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                    >
                        <Shield className="h-4 w-4" />
                        Upload Documents
                    </Link>
                </div>
            </div>
        );
    }

    /* ---- Validation ---- */
    function validate(): boolean {
        const next: Record<string, string> = {};

        if (!title.trim()) next.title = "Campaign title is required.";
        if (!description.trim()) next.description = "Please add a description.";
        if (!targetAmount || Number(targetAmount) <= 0)
            next.targetAmount = "Enter a valid target amount.";

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    /* ---- Submit ---- */
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            let imagePath: string | undefined;

            // Upload image first if selected
            if (imageFile) {
                setImageUploading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("You must be signed in.");
                imagePath = await uploadCampaignImage(imageFile, user.id);
                setImageUploading(false);
            }

            await createCampaign({
                title: title.trim(),
                description: description.trim(),
                target_amount: Number(targetAmount),
                image_url: imagePath,
                category,
                is_zakaat: isZakaat,
            });

            toast("Campaign submitted for approval!", "success");
            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 1800);
        } catch (err) {
            console.error("[CreateCampaign] error:", err);
            setImageUploading(false);
            setErrors({
                global:
                    err instanceof Error ? err.message : "Failed to create campaign.",
            });
        } finally {
            setLoading(false);
        }
    }

    /* ---- Success toast ---- */
    if (success) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="animate-[fadeSlideDown_0.35s_ease-out] flex flex-col items-center gap-4 rounded-2xl border border-primary-100 bg-primary-50 px-10 py-12 text-center shadow-lg">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white shadow-md">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">
                        Campaign Submitted!
                    </h2>
                    <p className="max-w-xs text-sm text-neutral-500">
                        Your campaign has been submitted for approval. You&apos;ll be
                        notified once it&apos;s reviewed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Create Campaign
                </h1>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Tell the world about your cause. Campaigns are reviewed before going
                    live.
                </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg sm:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <FloatingField
                        id="campaign-title"
                        label="Campaign Title"
                        value={title}
                        onChange={setTitle}
                        error={errors.title}
                        placeholder="e.g. Build a School in Rural Sindh"
                    />

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="campaign-desc"
                            className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-600 uppercase"
                        >
                            Description
                        </label>
                        <textarea
                            id="campaign-desc"
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your campaign, its goals, and how the funds will be used…"
                            className="input-field resize-none"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-danger">{errors.description}</p>
                        )}
                    </div>

                    {/* Category + Amount row */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Category */}
                        <div>
                            <label
                                htmlFor="campaign-category"
                                className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-600 uppercase"
                            >
                                Category
                            </label>
                            <select
                                id="campaign-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input-field"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Target Amount */}
                        <FloatingField
                            id="campaign-amount"
                            label="Target Amount (PKR)"
                            type="number"
                            value={targetAmount}
                            onChange={setTargetAmount}
                            error={errors.targetAmount}
                            placeholder="e.g. 500000"
                        />
                    </div>

                    {/* Image Upload */}
                    <ImageUpload
                        onFileSelect={(file) => setImageFile(file)}
                        onClear={() => setImageFile(null)}
                        uploading={imageUploading}
                        error={errors.image}
                    />

                    {/* Zakaat toggle */}
                    <button
                        type="button"
                        onClick={() => setIsZakaat((p) => !p)}
                        className={`inline-flex items-center gap-2.5 rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-200 ${isZakaat
                            ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                            : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                            }`}
                    >
                        <Moon className="h-4 w-4" />
                        Zakaat Eligible
                        <span
                            className={`ml-1 inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${isZakaat ? "bg-teal-500" : "bg-neutral-300"
                                }`}
                        >
                            <span
                                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isZakaat ? "translate-x-4" : "translate-x-1"
                                    }`}
                            />
                        </span>
                    </button>

                    {/* Global Error */}
                    {errors.global && (
                        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-danger">
                            {errors.global}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3.5 text-base"
                    >
                        {loading && <Spinner />}
                        {loading ? "Submitting…" : "Submit Campaign for Approval"}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Helper components                                                 */
/* ------------------------------------------------------------------ */

function FloatingField({
    id,
    label,
    value,
    onChange,
    placeholder,
    error,
    type = "text",
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-600 uppercase"
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`input-field ${error ? "!border-danger" : ""}`}
            />
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
    );
}

function Spinner() {
    return (
        <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
        </svg>
    );
}
