"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { RoleKey } from "../../lib/roles";

type SelectableRole = Extract<RoleKey, "DONOR" | "NGO">;

export default function RegisterPage() {
    const router = useRouter();
    const { signUp } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<SelectableRole>("DONOR");
    const [organizationName, setOrganizationName] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState("");
    const [loading, setLoading] = useState(false);

    function validate(): boolean {
        const next: Record<string, string> = {};

        if (!fullName.trim()) next.fullName = "Full name is required.";
        if (!email.trim()) next.email = "Email is required.";
        if (!password) next.password = "Password is required.";
        else if (password.length < 6)
            next.password = "Password must be at least 6 characters.";
        if (role === "NGO" && !organizationName.trim())
            next.organizationName = "Organization name is required for NGOs.";

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setGlobalError("");

        if (!validate()) return;

        setLoading(true);
        try {
            await signUp({
                email,
                password,
                fullName,
                role,
                organizationName: role === "NGO" ? organizationName : undefined,
            });
            router.refresh();
            router.push("/dashboard");
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Registration failed.";
            console.error("[Register] error:", err);
            setGlobalError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4 py-12">
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
                        Create your account
                    </h1>
                    <p className="mt-1.5 text-sm text-neutral-500">
                        Join DonateNow and start making a difference
                    </p>
                </div>

                {/* Card */}
                <div className="card p-8 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <Field
                            id="register-fullname"
                            label="Full Name"
                            value={fullName}
                            onChange={setFullName}
                            placeholder="Jane Doe"
                            error={errors.fullName}
                        />

                        {/* Email */}
                        <Field
                            id="register-email"
                            label="Email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={setEmail}
                            placeholder="you@example.com"
                            error={errors.email}
                        />

                        {/* Password */}
                        <Field
                            id="register-password"
                            label="Password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={setPassword}
                            placeholder="••••••••"
                            error={errors.password}
                        />

                        {/* Role Toggle */}
                        <div>
                            <span className="mb-2 block text-xs font-semibold tracking-wide text-neutral-600 uppercase">
                                I am a
                            </span>
                            <div className="flex gap-2">
                                {(["DONOR", "NGO"] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${role === r
                                            ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                                            : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                                            }`}
                                    >
                                        {r === "DONOR" ? "Donor" : "NGO"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Organization Name (conditional) */}
                        {role === "NGO" && (
                            <div className="animate-[fadeSlideDown_0.25s_ease-out]">
                                <Field
                                    id="register-org"
                                    label="Organization Name"
                                    value={organizationName}
                                    onChange={setOrganizationName}
                                    placeholder="My Awesome NGO"
                                    error={errors.organizationName}
                                />
                            </div>
                        )}

                        {/* Global Error */}
                        {globalError && (
                            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-danger">
                                {globalError}
                            </p>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                            {loading && <Spinner />}
                            {loading ? "Creating account…" : "Create Account"}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-neutral-500">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-primary-600 transition hover:text-primary-700"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Tiny helper components                                            */
/* ------------------------------------------------------------------ */

function Field({
    id,
    label,
    value,
    onChange,
    placeholder,
    error,
    type = "text",
    autoComplete,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    autoComplete?: string;
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
                autoComplete={autoComplete}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`input-field ${error ? "input-error" : ""}`}
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
