"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../lib/roles";
import { supabase } from "../../lib/supabaseClient";
import { getAdminDashboard, getNgoDashboard, getDonorDashboard, DashboardMetrics } from "../../services/dashboardService";
import { Loader2, Receipt } from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            if (!user) return;
            try {
                // Fetch role from profiles
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role_id")
                    .eq("id", user.id)
                    .single();

                const roleId = profile?.role_id;
                setRole(roleId);

                if (roleId === ROLES.ADMIN) {
                    setMetrics(await getAdminDashboard());
                } else if (roleId === ROLES.NGO) {
                    setMetrics(await getNgoDashboard(user.id));
                } else {
                    setMetrics(await getDonorDashboard(user.id));
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchMetrics();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const m = metrics || {
        metric1: { label: "Data", value: "—", color: "bg-primary-50 text-primary-600" },
        metric2: { label: "Data", value: "—", color: "bg-accent-50 text-accent-600" },
        metric3: { label: "Data", value: "—", color: "bg-emerald-50 text-emerald-600" },
        recentActivity: [],
    };

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Dashboard
            </h1>
            <p className="mt-2 text-neutral-500">
                Welcome to your DonateNow dashboard. Here is an overview of your activity.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[m.metric1, m.metric2, m.metric3].map((stat) => (
                    <div key={stat.label} className="card p-6">
                        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                            {stat.label}
                        </p>
                        <p className={`mt-2 text-3xl font-bold ${stat.color.split(" ")[1]}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="mb-6 text-lg font-bold text-neutral-900">Recent Activity</h2>

                {m.recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200">
                            <Receipt className="h-6 w-6 text-neutral-400" />
                        </div>
                        <h3 className="mt-4 text-sm font-bold text-neutral-900">No activity yet</h3>
                        <p className="mt-1 text-sm text-neutral-500">
                            When donations or other activities happen, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-neutral-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Campaign</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {m.recentActivity.map((activity) => (
                                    <tr key={activity.id} className="transition hover:bg-neutral-50/50">
                                        <td className="px-6 py-4 text-neutral-500">
                                            {new Date(activity.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                            {activity.campaigns?.title || "Platform Donation"}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">
                                            ${activity.amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500">
                                            {activity.is_anonymous ? "Anonymous" : activity.profiles?.full_name || (role === ROLES.DONOR ? (activity.is_zakaat ? "Zakaat" : "Sadaqah") : "Donor")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
