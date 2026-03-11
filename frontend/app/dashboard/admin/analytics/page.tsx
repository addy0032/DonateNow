"use client";

import { useEffect, useRef, useState } from "react";
import {
    BarChart3,
    DollarSign,
    Layers,
    TrendingUp,
    Users,
} from "lucide-react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
    TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import AnimatedSection from "../../../../components/AnimatedSection";
import {
    getAnalyticsSummary,
    getDonationsByCategory,
    getDonationsOverTime,
    getCampaignDistribution,
    type AnalyticsSummary,
    type CategoryDonation,
    type DonationOverTime,
    type CampaignDistribution,
} from "../../../../services/analyticsService";

/* ── Register ECharts modules ─────────────────────────────────────── */
echarts.use([
    BarChart,
    LineChart,
    PieChart,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    TitleComponent,
    CanvasRenderer,
]);

/* ── Color palette (soft, muted, Stripe-style) ────────────────────── */
const PALETTE = [
    "#10b981", // emerald
    "#6366f1", // indigo
    "#f59e0b", // amber
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#8b5cf6", // violet
];

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function AdminAnalyticsPage() {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [categoryData, setCategoryData] = useState<CategoryDonation[]>([]);
    const [timeData, setTimeData] = useState<DonationOverTime[]>([]);
    const [distData, setDistData] = useState<CampaignDistribution[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAll() {
            try {
                const [s, c, t, d] = await Promise.all([
                    getAnalyticsSummary(),
                    getDonationsByCategory(),
                    getDonationsOverTime(),
                    getCampaignDistribution(),
                ]);
                setSummary(s);
                setCategoryData(c);
                setTimeData(t);
                setDistData(d);
            } catch (err) {
                console.error("Analytics fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {/* Page header */}
            <AnimatedSection as="div">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Analytics
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Platform overview — donations, campaigns &amp; users.
                </p>
            </AnimatedSection>

            {/* ── Summary cards ─────────────────────────────────────── */}
            <AnimatedSection
                as="div"
                delay={0.1}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
                <StatCard
                    icon={<DollarSign className="h-5 w-5" />}
                    label="Total Funds Raised"
                    value={formatCurrency(summary?.totalFundsRaised ?? 0)}
                    accent="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    icon={<TrendingUp className="h-5 w-5" />}
                    label="Total Donations"
                    value={String(summary?.totalDonations ?? 0)}
                    accent="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    icon={<Layers className="h-5 w-5" />}
                    label="Total Campaigns"
                    value={String(summary?.totalCampaigns ?? 0)}
                    accent="bg-amber-50 text-amber-600"
                />
                <StatCard
                    icon={<Users className="h-5 w-5" />}
                    label="Total Users"
                    value={String(summary?.totalUsers ?? 0)}
                    accent="bg-pink-50 text-pink-600"
                />
            </AnimatedSection>

            {/* ── Charts row 1: Bar + Line ──────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
                <AnimatedSection as="div" delay={0.15}>
                    <ChartCard title="Donations by Category">
                        <BarChartComponent data={categoryData} />
                    </ChartCard>
                </AnimatedSection>

                <AnimatedSection as="div" delay={0.2}>
                    <ChartCard title="Donations Over Time (30 days)">
                        <LineChartComponent data={timeData} />
                    </ChartCard>
                </AnimatedSection>
            </div>

            {/* ── Charts row 2: Pie ─────────────────────────────────── */}
            <AnimatedSection as="div" delay={0.25} className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Campaign Distribution">
                    <PieChartComponent data={distData} />
                </ChartCard>
            </AnimatedSection>
        </div>
    );
}

/* ================================================================== */
/*  STAT CARD                                                         */
/* ================================================================== */

function StatCard({
    icon,
    label,
    value,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
            >
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                    {label}
                </p>
                <p className="mt-0.5 text-xl font-bold text-neutral-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

/* ================================================================== */
/*  CHART CARD WRAPPER                                                */
/* ================================================================== */

function ChartCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-6 py-4">
                <BarChart3 className="h-4 w-4 text-neutral-400" />
                <h3 className="text-sm font-semibold text-neutral-700">
                    {title}
                </h3>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

/* ================================================================== */
/*  ECHARTS COMPONENTS (imperative, no wrapper library)               */
/* ================================================================== */

/* ── Shared tooltip styling ──────────────────────────────────────── */
const TOOLTIP_STYLE = {
    backgroundColor: "#fff",
    borderColor: "#e5e5e5",
    borderWidth: 1,
    textStyle: { color: "#333", fontSize: 12 },
    extraCssText:
        "border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,0.08);padding:10px 14px;",
};

/* ── Bar Chart ───────────────────────────────────────────────────── */

function BarChartComponent({ data }: { data: CategoryDonation[] }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const chart = echarts.init(ref.current);

        chart.setOption({
            tooltip: { ...TOOLTIP_STYLE, trigger: "axis" },
            grid: { left: 60, right: 20, top: 20, bottom: 40 },
            xAxis: {
                type: "category",
                data: data.map((d) => d.category),
                axisLine: { lineStyle: { color: "#e5e5e5" } },
                axisTick: { show: false },
                axisLabel: { color: "#78716c", fontSize: 11 },
            },
            yAxis: {
                type: "value",
                splitLine: { lineStyle: { color: "#f5f5f4", type: "dashed" } },
                axisLabel: {
                    color: "#a8a29e",
                    fontSize: 11,
                    formatter: (v: number) => `₨${(v / 1000).toFixed(0)}k`,
                },
            },
            series: [
                {
                    type: "bar",
                    data: data.map((d) => d.total),
                    barWidth: "50%",
                    itemStyle: {
                        borderRadius: [6, 6, 0, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: PALETTE[0] },
                            { offset: 1, color: "#34d399" },
                        ]),
                    },
                },
            ],
        });

        const resizeHandler = () => chart.resize();
        window.addEventListener("resize", resizeHandler);
        return () => {
            window.removeEventListener("resize", resizeHandler);
            chart.dispose();
        };
    }, [data]);

    return <div ref={ref} className="h-[320px] w-full" />;
}

/* ── Line Chart ──────────────────────────────────────────────────── */

function LineChartComponent({ data }: { data: DonationOverTime[] }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const chart = echarts.init(ref.current);

        chart.setOption({
            tooltip: {
                ...TOOLTIP_STYLE,
                trigger: "axis",
            },
            grid: { left: 60, right: 20, top: 20, bottom: 40 },
            xAxis: {
                type: "category",
                data: data.map((d) => {
                    const dt = new Date(d.date);
                    return `${dt.getDate()} ${dt.toLocaleString("en", { month: "short" })}`;
                }),
                boundaryGap: false,
                axisLine: { lineStyle: { color: "#e5e5e5" } },
                axisTick: { show: false },
                axisLabel: { color: "#78716c", fontSize: 11 },
            },
            yAxis: {
                type: "value",
                splitLine: { lineStyle: { color: "#f5f5f4", type: "dashed" } },
                axisLabel: {
                    color: "#a8a29e",
                    fontSize: 11,
                    formatter: (v: number) => `₨${(v / 1000).toFixed(0)}k`,
                },
            },
            series: [
                {
                    type: "line",
                    data: data.map((d) => d.total),
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 6,
                    lineStyle: { width: 2.5, color: PALETTE[1] },
                    itemStyle: { color: PALETTE[1] },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: "rgba(99,102,241,0.25)" },
                            { offset: 1, color: "rgba(99,102,241,0.02)" },
                        ]),
                    },
                },
            ],
        });

        const resizeHandler = () => chart.resize();
        window.addEventListener("resize", resizeHandler);
        return () => {
            window.removeEventListener("resize", resizeHandler);
            chart.dispose();
        };
    }, [data]);

    return <div ref={ref} className="h-[320px] w-full" />;
}

/* ── Pie Chart ───────────────────────────────────────────────────── */

function PieChartComponent({ data }: { data: CampaignDistribution[] }) {
    const ref = useRef<HTMLDivElement>(null);

    const STATUS_COLORS: Record<string, string> = {
        approved: PALETTE[0],
        pending: PALETTE[2],
        rejected: "#ef4444",
    };

    useEffect(() => {
        if (!ref.current) return;
        const chart = echarts.init(ref.current);

        chart.setOption({
            tooltip: { ...TOOLTIP_STYLE, trigger: "item" },
            legend: {
                bottom: 10,
                textStyle: { color: "#78716c", fontSize: 12 },
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 20,
                icon: "circle",
            },
            series: [
                {
                    type: "pie",
                    radius: ["42%", "70%"],
                    center: ["50%", "45%"],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 8,
                        borderColor: "#fff",
                        borderWidth: 3,
                    },
                    label: { show: false },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 14,
                            fontWeight: "bold",
                        },
                    },
                    data: data.map((d) => ({
                        name: capitalize(d.status),
                        value: d.count,
                        itemStyle: {
                            color:
                                STATUS_COLORS[d.status] ??
                                PALETTE[
                                data.indexOf(d) % PALETTE.length
                                ],
                        },
                    })),
                },
            ],
        });

        const resizeHandler = () => chart.resize();
        window.addEventListener("resize", resizeHandler);
        return () => {
            window.removeEventListener("resize", resizeHandler);
            chart.dispose();
        };
    }, [data]);

    return <div ref={ref} className="h-[320px] w-full" />;
}

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

function formatCurrency(n: number) {
    return `₨ ${n.toLocaleString("en-PK")}`;
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
