"use client";

import { Calculator, CheckCircle, Heart, Moon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { saveZakaatCalculation } from "../../services/zakaatService";
import { useToast } from "../../components/Toast";

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ZakaatPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [gold, setGold] = useState("");
    const [cash, setCash] = useState("");
    const [investments, setInvestments] = useState("");
    const [others, setOthers] = useState("");
    const [liabilities, setLiabilities] = useState("");

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const totalAssets = useMemo(() => {
        return (Number(gold) || 0) + (Number(cash) || 0) + (Number(investments) || 0) + (Number(others) || 0);
    }, [gold, cash, investments, others]);

    const net = useMemo(() => Math.max(totalAssets - (Number(liabilities) || 0), 0), [totalAssets, liabilities]);
    const zakaatDue = useMemo(() => net * 0.025, [net]);

    async function handleSave() {
        if (!user) return;
        setSaving(true);
        try {
            await saveZakaatCalculation({
                total_assets: totalAssets,
                total_liabilities: Number(liabilities) || 0,
                net_amount: net,
                zakaat_due: zakaatDue,
            });
            toast("Zakaat calculation saved!", "success");
            setSaved(true);
        } catch (err) {
            console.error("[Zakaat] save error:", err);
            toast("Failed to save calculation.", "error");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-teal-600 to-emerald-700">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />
                <div className="section-container relative py-16 text-center text-white sm:py-20">
                    <Moon className="mx-auto mb-4 h-10 w-10 opacity-80" />
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Zakaat Calculator
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-teal-100">
                        Zakaat is one of the five pillars of Islam — a duty to give 2.5% of
                        your net wealth annually to those in need. Use this calculator
                        to determine the amount you owe.
                    </p>
                </div>
            </section>

            {/* Calculator */}
            <section className="section-container -mt-8 pb-20">
                <div className="mx-auto max-w-lg">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl sm:p-10">
                        {saved ? (
                            /* ---- Success State ---- */
                            <div className="flex flex-col items-center py-8 text-center">
                                <div className="animate-[bounceIn_0.5s_ease-out] flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                                    <CheckCircle className="h-8 w-8 text-teal-600" />
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-neutral-900">
                                    Calculation Saved
                                </h3>
                                <p className="mt-2 text-sm text-neutral-500">
                                    Your Zakaat due is{" "}
                                    <span className="font-bold text-teal-600">
                                        {formatCurrency(zakaatDue)}
                                    </span>
                                </p>
                                <Link
                                    href="/explore?zakaat=true"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                                >
                                    <Heart className="h-4 w-4" />
                                    Donate Zakaat Now
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-7 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
                                        <Calculator className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-neutral-900">
                                            Calculate Your Zakaat
                                        </h2>
                                        <p className="text-xs text-neutral-400">
                                            Enter your assets and liabilities below
                                        </p>
                                    </div>
                                </div>

                                {/* Asset fields */}
                                <div className="space-y-4 mb-5">
                                    <AssetField
                                        id="zakaat-gold"
                                        label="Gold & Silver Value"
                                        hint="Market value of all gold and silver you own"
                                        value={gold}
                                        onChange={setGold}
                                    />
                                    <AssetField
                                        id="zakaat-cash"
                                        label="Cash & Savings"
                                        hint="Bank accounts, cash in hand, savings"
                                        value={cash}
                                        onChange={setCash}
                                    />
                                    <AssetField
                                        id="zakaat-investments"
                                        label="Investments"
                                        hint="Stocks, mutual funds, business inventory"
                                        value={investments}
                                        onChange={setInvestments}
                                    />
                                    <AssetField
                                        id="zakaat-others"
                                        label="Other Assets"
                                        hint="Property held for sale, receivables, other"
                                        value={others}
                                        onChange={setOthers}
                                    />
                                </div>

                                {/* Total assets summary */}
                                <div className="mb-5 flex items-center justify-between rounded-lg bg-teal-50 px-4 py-2.5 text-sm">
                                    <span className="font-medium text-teal-700">Total Assets</span>
                                    <span className="font-bold text-teal-700">{formatCurrency(totalAssets)}</span>
                                </div>

                                {/* Liabilities */}
                                <AssetField
                                    id="zakaat-liabilities"
                                    label="Total Liabilities"
                                    hint="Debts, pending bills, loans, outstanding dues"
                                    value={liabilities}
                                    onChange={setLiabilities}
                                />

                                {/* Results */}
                                <div className="mt-6 mb-7 space-y-3 rounded-xl bg-neutral-50 p-5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500">Net Zakaat-able Wealth</span>
                                        <span className="font-semibold text-neutral-800">
                                            {formatCurrency(net)}
                                        </span>
                                    </div>
                                    <hr className="border-neutral-200" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-teal-700">
                                            Zakaat Due (2.5%)
                                        </span>
                                        <span className="text-2xl font-bold text-teal-600">
                                            {formatCurrency(zakaatDue)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {user ? (
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving || zakaatDue <= 0}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Spinner />
                                        ) : (
                                            <Moon className="h-4 w-4" />
                                        )}
                                        {saving ? "Saving…" : "Save & Donate Zakaat"}
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700"
                                    >
                                        Login to Save & Donate
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Info cards */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-neutral-200 bg-white p-5">
                            <h4 className="text-sm font-bold text-neutral-800">
                                Who pays Zakaat?
                            </h4>
                            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                                Every Muslim whose net wealth exceeds the Nisab threshold
                                (approximately the value of 87.48 grams of gold) must
                                pay Zakaat annually.
                            </p>
                        </div>
                        <div className="rounded-xl border border-neutral-200 bg-white p-5">
                            <h4 className="text-sm font-bold text-neutral-800">
                                Where does it go?
                            </h4>
                            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                                Zakaat is distributed to those in need — the poor,
                                the debt-ridden, travelers in difficulty, and others
                                as outlined in Islamic jurisprudence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Asset input field                                                  */
/* ------------------------------------------------------------------ */

function AssetField({
    id,
    label,
    hint,
    value,
    onChange,
}: {
    id: string;
    label: string;
    hint: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1 block text-xs font-semibold tracking-wide text-neutral-600 uppercase"
            >
                {label}
            </label>
            <p className="mb-1.5 text-[11px] text-neutral-400">{hint}</p>
            <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 select-none text-sm font-semibold text-neutral-400">
                    Rs
                </span>
                <input
                    id={id}
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="0"
                    className="input-field text-lg font-semibold"
                    style={{ paddingLeft: "3rem" }}
                />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
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
