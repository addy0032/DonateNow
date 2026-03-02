"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }
        if (!password) {
            setError("Password is required.");
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
            // Refresh the server-side context so the middleware picks up the
            // new auth cookies before we navigate to a protected route.
            router.refresh();
            router.push(redirectTo);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Sign-in failed.";
            console.error("[Login] error:", err);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4">
            {/* Ambient gradient blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary-200/40 blur-[100px]" />
            <div className="pointer-events-none absolute -right-32 -bottom-32 h-[420px] w-[420px] rounded-full bg-accent-200/30 blur-[100px]" />

            <div className="relative z-10 w-full max-w-md">
                {/* Brand */}
                <div className="mb-8 text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-xl text-white shadow-lg shadow-primary-600/25">
                        💚
                    </span>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
                        Welcome back
                    </h1>
                    <p className="mt-1.5 text-sm text-neutral-500">
                        Sign in to your DonateNow account
                    </p>
                </div>

                {/* Card */}
                <div className="card p-8 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="login-email"
                                className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-600 uppercase"
                            >
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input-field"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="login-password"
                                className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-600 uppercase"
                            >
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-danger">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                            {loading && <Spinner />}
                            {loading ? "Signing in…" : "Sign In"}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-neutral-500">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary-600 transition hover:text-primary-700"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
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
