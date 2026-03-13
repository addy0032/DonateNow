"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, Moon, TrendingUp } from "lucide-react";
import {
    getMyZakaatHistory,
    getMyZakaatDonations,
    type ZakaatCalculation,
} from "../../../services/zakaatService";
import AnimatedSection from "../../../components/AnimatedSection";
import EmptyState from "../../../components/EmptyState";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ZakaatHistoryPage() {
    const [calculations, setCalculations] = useState<ZakaatCalculation[]>([]);
    const [donations, setDonations] = useState<{ amount: number; created_at: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getMyZakaatHistory(), getMyZakaatDonations()])
            .then(([calcs, dons]) => {
                setCalculations(calcs);
                setDonations(dons);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalPaid = useMemo(
        () => donations.reduce((sum, d) => sum + d.amount, 0),
        [donations],
    );

    const totalDue = useMemo(
        () => calculations.reduce((sum, c) => sum + c.zakaat_due, 0),
        [calculations],
    );

    /* ---- Chart: Yearly comparison ---- */
    const yearlyData = useMemo(() => {
        const byYear: Record<string, { due: number; paid: number }> = {};

        for (const c of calculations) {
            const y = new Date(c.created_at).getFullYear().toString();
            if (!byYear[y]) byYear[y] = { due: 0, paid: 0 };
            byYear[y].due += c.zakaat_due;
        }
        for (const d of donations) {
            const y = new Date(d.created_at).getFullYear().toString();
            if (!byYear[y]) byYear[y] = { due: 0, paid: 0 };
            byYear[y].paid += d.amount;
        }

        const years = Object.keys(byYear).sort();
        return {
            years,
            due: years.map((y) => Math.round(byYear[y].due)),
            paid: years.map((y) => Math.round(byYear[y].paid)),
        };
    }, [calculations, donations]);

    const chartOption = {
        tooltip: { trigger: "axis" as const },
        legend: { data: ["Zakaat Due", "Zakaat Paid"], bottom: 0 },
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: { type: "category" as const, data: yearlyData.years },
        yAxis: { type: "value" as const, axisLabel: { formatter: "Rs {value}" } },
        series: [
            {
                name: "Zakaat Due",
                type: "bar",
                data: yearlyData.due,
                itemStyle: { color: "#14b8a6", borderRadius: [6, 6, 0, 0] },
            },
            {
                name: "Zakaat Paid",
                type: "bar",
                data: yearlyData.paid,
                itemStyle: { color: "#6366f1", borderRadius: [6, 6, 0, 0] },
            },
        ],
    };

    if (loading) return <SkeletonPage />;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5">
                    <Moon className="h-6 w-6 text-teal-600" />
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                        Zakaat History
                    </h1>
                </div>
                <p className="mt-1.5 text-sm text-neutral-500">
                    Track your Zakaat calculations and donations over time.
                </p>
            </div>

            {/* Summary Cards */}
            <AnimatedSection className="mb-8 grid gap-4 sm:grid-cols-3">
                <SummaryCard
                    icon={<Moon className="h-5 w-5 text-teal-600" />}
                    label="Total Zakaat Due"
                    value={formatCurrency(totalDue)}
                    bg="bg-teal-50"
                />
                <SummaryCard
                    icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
                    label="Total Zakaat Paid"
                    value={formatCurrency(totalPaid)}
                    bg="bg-indigo-50"
                />
                <SummaryCard
                    icon={<Calendar className="h-5 w-5 text-amber-600" />}
                    label="Calculations Made"
                    value={String(calculations.length)}
                    bg="bg-amber-50"
                />
            </AnimatedSection>

            {calculations.length === 0 ? (
                <EmptyState
                    icon={<Moon className="h-8 w-8" />}
                    title="No Zakaat calculations yet"
                    description="Use the Zakaat Calculator to compute your obligation and it will appear here."
                    actionLabel="Calculate Zakaat"
                    actionHref="/zakaat"
                />
            ) : (
                <>
                    {/* Yearly Chart */}
                    {yearlyData.years.length > 0 && (
                        <AnimatedSection className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-sm font-bold tracking-wide text-neutral-800 uppercase">
                                Yearly Comparison
                            </h3>
                            <ReactECharts option={chartOption} style={{ height: 280 }} />
                        </AnimatedSection>
                    )}

                    {/* History Table */}
                    <AnimatedSection className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Total Assets</th>
                                        <th className="px-5 py-3">Liabilities</th>
                                        <th className="px-5 py-3">Net Wealth</th>
                                        <th className="px-5 py-3">Zakaat Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calculations.map((c) => (
                                        <tr
                                            key={c.id}
                                            className="border-b border-neutral-50 transition hover:bg-neutral-50/60"
                                        >
                                            <td className="px-5 py-3.5 font-medium text-neutral-800">
                                                {new Date(c.created_at).toLocaleDateString("en-PK", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-600">
                                                {formatCurrency(c.total_assets)}
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-600">
                                                {formatCurrency(c.total_liabilities)}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-neutral-800">
                                                {formatCurrency(c.net_amount)}
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-teal-600">
                                                {formatCurrency(c.zakaat_due)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </AnimatedSection>
                </>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function SummaryCard({
    icon,
    label,
    value,
    bg,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    bg: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-neutral-500">{label}</p>
                <p className="mt-0.5 text-lg font-bold text-neutral-900">{value}</p>
            </div>
        </div>
    );
}

function SkeletonPage() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
            <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
                ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
    );
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
    }).format(amount);
}
