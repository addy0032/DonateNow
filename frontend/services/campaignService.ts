import { supabase } from "../lib/supabaseClient";
import type {
    Campaign,
    CampaignStatus,
    CreateCampaignPayload,
} from "../types/campaign";

/**
 * Create a new campaign (status defaults to "pending").
 * The `creator_id` field is set to the currently authenticated user.
 */
export async function createCampaign(
    payload: CreateCampaignPayload,
): Promise<Campaign> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be signed in to create a campaign.");

    // Auto-fill organization_name from the user's profile.
    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_name")
        .eq("id", user.id)
        .single();

    const orgName =
        payload.organization_name ?? profile?.organization_name ?? null;

    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            title: payload.title,
            description: payload.description,
            target_amount: payload.target_amount,
            image_url: payload.image_url ?? null,
            organization_name: orgName,
            category: payload.category ?? "Other",
            is_zakaat: payload.is_zakaat ?? false,
            creator_id: user.id,
            status: "pending" as CampaignStatus,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Campaign;
}

/**
 * Fetch all campaigns with status "approved".
 * Results are ordered newest-first.
 */
export async function getApprovedCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Campaign[];
}

/**
 * Fetch a single campaign by its ID.
 */
export async function getCampaignById(
    campaignId: string,
): Promise<Campaign> {
    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

    if (error) throw new Error(error.message);
    return data as Campaign;
}

/**
 * Update the status of a campaign (admin action).
 */
export async function updateCampaignStatus(
    campaignId: string,
    status: CampaignStatus,
): Promise<Campaign> {
    const { data, error } = await supabase
        .from("campaigns")
        .update({ status })
        .eq("id", campaignId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Campaign;
}

/**
 * Fetch all campaigns created by the currently authenticated user.
 * Results are ordered newest-first.
 */
export async function getMyCampaigns(): Promise<Campaign[]> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be signed in.");

    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Campaign[];
}

/**
 * Fetch ALL campaigns (admin). Results ordered newest-first.
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Campaign[];
}
