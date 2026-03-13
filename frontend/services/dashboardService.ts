import { supabase } from "../lib/supabaseClient";

export interface DashboardMetrics {
    metric1: { label: string; value: string | number; color: string };
    metric2: { label: string; value: string | number; color: string };
    metric3: { label: string; value: string | number; color: string };
    recentActivity: any[];
}

export async function getAdminDashboard(): Promise<DashboardMetrics> {
    // Total platform donations
    const { data: donations } = await supabase.from("donations").select("amount");
    const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    // Active campaigns
    const { count: activeCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

    // Verified NGOs
    const { count: verifiedCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("ngo_verified", true);

    // Recent 5 donations
    const { data: recent } = await supabase
        .from("donations")
        .select("id, amount, created_at, is_anonymous, campaigns(title), profiles:donor_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        metric1: { label: "Total Platform Donations", value: `$${totalDonations.toLocaleString()}`, color: "bg-emerald-50 text-emerald-600" },
        metric2: { label: "Active Campaigns", value: activeCount || 0, color: "bg-blue-50 text-blue-600" },
        metric3: { label: "Verified NGOs", value: verifiedCount || 0, color: "bg-purple-50 text-purple-600" },
        recentActivity: recent || [],
    };
}

export async function getNgoDashboard(userId: string): Promise<DashboardMetrics> {
    // To get NGO's total raised, we need donations for their campaigns
    // Join syntax: campaign!inner(ngo_id)
    const { data: donations } = await supabase
        .from("donations")
        .select("amount, campaigns!inner(ngo_id)")
        .eq("campaigns.ngo_id", userId);

    const totalRaised = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const totalDonationsCount = donations?.length || 0;

    const { count: activeCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("ngo_id", userId)
        .eq("status", "active");

    const { data: recent } = await supabase
        .from("donations")
        .select("id, amount, created_at, is_anonymous, campaigns!inner(title, ngo_id), profiles:donor_id(full_name)")
        .eq("campaigns.ngo_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        metric1: { label: "Total Raised", value: `$${totalRaised.toLocaleString()}`, color: "bg-emerald-50 text-emerald-600" },
        metric2: { label: "Active Campaigns", value: activeCount || 0, color: "bg-blue-50 text-blue-600" },
        metric3: { label: "Total Donations", value: totalDonationsCount, color: "bg-purple-50 text-purple-600" },
        recentActivity: recent || [],
    };
}

export async function getDonorDashboard(userId: string): Promise<DashboardMetrics> {
    const { data: donations } = await supabase
        .from("donations")
        .select("amount, is_zakaat")
        .eq("donor_id", userId);

    const totalDonated = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const zakaatPaid = donations?.filter(d => d.is_zakaat).reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const donationsCount = donations?.length || 0;

    const { data: recent } = await supabase
        .from("donations")
        .select("id, amount, created_at, is_zakaat, campaigns(title)")
        .eq("donor_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        metric1: { label: "Total Donated", value: `$${totalDonated.toLocaleString()}`, color: "bg-emerald-50 text-emerald-600" },
        metric2: { label: "Total Contributions", value: donationsCount, color: "bg-blue-50 text-blue-600" },
        metric3: { label: "Zakaat Paid", value: `$${zakaatPaid.toLocaleString()}`, color: "bg-purple-50 text-purple-600" },
        recentActivity: recent || [],
    };
}
