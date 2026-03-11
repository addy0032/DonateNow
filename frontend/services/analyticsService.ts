import { supabase } from "../lib/supabaseClient";

/* ------------------------------------------------------------------ */
/*  Admin Analytics Service                                           */
/* ------------------------------------------------------------------ */

export interface AnalyticsSummary {
    totalDonations: number;
    totalCampaigns: number;
    totalUsers: number;
    totalFundsRaised: number;
}

export interface CategoryDonation {
    category: string;
    total: number;
}

export interface DonationOverTime {
    date: string;
    total: number;
}

export interface CampaignDistribution {
    status: string;
    count: number;
}

/**
 * Fetch high-level summary metrics for the admin dashboard.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const [donationsRes, campaignsRes, usersRes] = await Promise.all([
        supabase.from("donations").select("amount"),
        supabase.from("campaigns").select("id"),
        supabase.from("profiles").select("id"),
    ]);

    const donations = donationsRes.data ?? [];
    const campaigns = campaignsRes.data ?? [];
    const users = usersRes.data ?? [];

    const totalFundsRaised = donations.reduce(
        (sum: number, d: { amount: number }) => sum + (d.amount ?? 0),
        0,
    );

    return {
        totalDonations: donations.length,
        totalCampaigns: campaigns.length,
        totalUsers: users.length,
        totalFundsRaised,
    };
}

/**
 * Donations grouped by campaign category.
 */
export async function getDonationsByCategory(): Promise<CategoryDonation[]> {
    // Fetch donations joined with campaign category
    const { data, error } = await supabase
        .from("donations")
        .select("amount, campaigns(category)");

    if (error) throw new Error(error.message);

    const map: Record<string, number> = {};
    for (const d of data ?? []) {
        const cat =
            (d.campaigns as unknown as { category: string })?.category ?? "Other";
        map[cat] = (map[cat] ?? 0) + (d.amount ?? 0);
    }

    return Object.entries(map).map(([category, total]) => ({ category, total }));
}

/**
 * Donations aggregated by day (last 30 days).
 */
export async function getDonationsOverTime(): Promise<DonationOverTime[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
        .from("donations")
        .select("amount, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const map: Record<string, number> = {};
    for (const d of data ?? []) {
        const date = new Date(d.created_at).toISOString().slice(0, 10);
        map[date] = (map[date] ?? 0) + (d.amount ?? 0);
    }

    return Object.entries(map).map(([date, total]) => ({ date, total }));
}

/**
 * Campaign count grouped by status.
 */
export async function getCampaignDistribution(): Promise<
    CampaignDistribution[]
> {
    const { data, error } = await supabase
        .from("campaigns")
        .select("status");

    if (error) throw new Error(error.message);

    const map: Record<string, number> = {};
    for (const c of data ?? []) {
        const s = c.status ?? "unknown";
        map[s] = (map[s] ?? 0) + 1;
    }

    return Object.entries(map).map(([status, count]) => ({ status, count }));
}
