"use client";

import { CheckCircle, Heart, Lock, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createDonation } from "../services/donationService";

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface DonationModalProps {
    campaignId: string;
    campaignTitle: string;
    targetAmount: number;
    currentAmount: number;
    isZakaat?: boolean;
    /** Called after a successful donation — refresh your campaign data. */
    onSuccess?: () => void;
    /** Close the modal. */
    onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Suggested amounts                                                 */
/* ------------------------------------------------------------------ */

const SUGGESTED = [500, 1000, 5000, 10000];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function DonationModal({
    campaignId,
    campaignTitle,
    targetAmount,
    currentAmount,
    isZakaat = false,
    onSuccess,
    onClose,
}: DonationModalProps) {
    const { user } = useAuth();

    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const progress =
        targetAmount > 0
            ? Math.min(((currentAmount + Number(amount || 0)) / targetAmount) * 100, 100)
            : 0;

    const remaining = Math.max(targetAmount - currentAmount, 0);

    /* ---- Submit ---- */
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            setError("Please enter a valid donation amount.");
            return;
        }

        if (!user) {
            setError("You must be signed in to donate.");
            return;
        }

        setLoading(true);
        try {
            await createDonation({
                amount: numAmount,
                campaign_id: campaignId,
                message: message.trim() || undefined,
                is_anonymous: anonymous,
                is_zakaat: isZakaat,
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2200);
        } catch (err) {
            console.error("[Donation] error:", err);
            setError(err instanceof Error ? err.message : "Donation failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="animate-[fadeSlideDown_0.3s_ease-out] relative mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* ---- Success State ---- */}
                {success ? (
                    <div className="flex flex-col items-center px-8 py-16 text-center">
                        <div className="animate-[bounceIn_0.5s_ease-out] flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                            <CheckCircle className="h-10 w-10 text-primary-600" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-neutral-900">
                            Thank you! 💚
                        </h3>
                        <p className="mt-2 max-w-xs text-sm text-neutral-500">
                            Your donation of{" "}
                            <span className="font-semibold text-primary-600">
                                {formatCurrency(Number(amount))}
                            </span>{" "}
                            has been received. You&apos;re making a real difference.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ---- Header ---- */}
                        <div className="border-b border-neutral-100 px-8 pt-8 pb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
                                    <Heart className="h-4 w-4 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900">
                                        Make a Donation
                                    </h2>
                                    <p className="text-xs text-neutral-400 line-clamp-1">
                                        {campaignTitle}
                                    </p>
                                </div>
                            </div>

                            {/* Progress preview */}
                            <div className="mt-5">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-xs text-neutral-400">
                                    <span>
                                        {formatCurrency(currentAmount)} raised
                                    </span>
                                    <span>
                                        {formatCurrency(remaining)} remaining
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ---- Form ---- */}
                        <form onSubmit={handleSubmit} className="px-8 py-6">
                            {/* Suggested amounts */}
                            <div className="mb-5">
                                <p className="mb-2.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                    Quick Select
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {SUGGESTED.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setAmount(String(s))}
                                            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-150 ${amount === String(s)
                                                ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                                                }`}
                                        >
                                            {formatCurrency(s)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Amount */}
                            <div className="mb-5">
                                <label
                                    htmlFor="donation-amount"
                                    className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-600 uppercase"
                                >
                                    Amount (PKR)
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 select-none text-base font-semibold text-neutral-400">
                                        Rs
                                    </span>
                                    <input
                                        id="donation-amount"
                                        type="number"
                                        min="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="input-field pl-14 text-lg font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div className="mb-5">
                                <label
                                    htmlFor="donation-message"
                                    className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase"
                                >
                                    Message
                                    <span className="font-normal normal-case text-neutral-400">
                                        (optional)
                                    </span>
                                </label>
                                <textarea
                                    id="donation-message"
                                    rows={2}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Leave an encouraging note…"
                                    className="input-field resize-none text-sm"
                                />
                            </div>

                            {/* Anonymous toggle */}
                            <button
                                type="button"
                                onClick={() => setAnonymous((p) => !p)}
                                className={`mb-5 inline-flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${anonymous
                                    ? "border-primary-300 bg-primary-50 text-primary-700"
                                    : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300"
                                    }`}
                            >
                                <span>Donate anonymously</span>
                                <span
                                    className={`inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${anonymous ? "bg-primary-500" : "bg-neutral-300"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${anonymous ? "translate-x-4" : "translate-x-1"
                                            }`}
                                    />
                                </span>
                            </button>

                            {/* Error */}
                            {error && (
                                <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !amount}
                                className="btn-primary flex w-full items-center justify-center gap-2.5 py-3.5 text-base disabled:opacity-50"
                            >
                                {loading ? (
                                    <Spinner />
                                ) : (
                                    <Lock className="h-4 w-4" />
                                )}
                                {loading
                                    ? "Processing…"
                                    : amount
                                        ? `Donate ${formatCurrency(Number(amount))} Securely`
                                        : "Donate Securely"}
                            </button>

                            <p className="mt-3 text-center text-[11px] text-neutral-400">
                                🔒 Your payment is secure. All donations are tracked
                                transparently.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

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

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
    }).format(amount);
}
