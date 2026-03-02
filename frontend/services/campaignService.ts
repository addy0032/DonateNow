import { supabase } from "../lib/supabaseClient";
import type {
    Campaign,
    CampaignStatus,
    CreateCampaignPayload,
} from "../types/campaign";

/**
 * Create a new campaign (status defaults to "pending").
 * The `created_by` field is set to the currently authenticated user.
 */
export async function createCampaign(
    payload: CreateCampaignPayload,
): Promise<Campaign> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be signed in to create a campaign.");

    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            title: payload.title,
            description: payload.description,
            goal_amount: payload.goal_amount,
            image_url: payload.image_url ?? null,
            organization_name: payload.organization_name ?? null,
            created_by: user.id,
            status: "pending" as CampaignStatus,
        })
        .select()
        .single();

    if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;
    return data as Campaign;
}
