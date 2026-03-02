import { supabase } from "../lib/supabaseClient";
import type { CreateDonationPayload, Donation } from "../types/donation";

/**
 * Create a new donation for a campaign.
 * The `donor_id` is set to the currently authenticated user.
 */
export async function createDonation(
    payload: CreateDonationPayload,
): Promise<Donation> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be signed in to make a donation.");

    const { data, error } = await supabase
        .from("donations")
        .insert({
            amount: payload.amount,
            campaign_id: payload.campaign_id,
            donor_id: user.id,
            message: payload.message ?? null,
        })
        .select()
        .single();

    if (error) throw error;
    return data as Donation;
}

/**
 * Fetch all donations for a specific campaign, newest-first.
 */
export async function getDonationsByCampaign(
    campaignId: string,
): Promise<Donation[]> {
    const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Donation[];
}

/**
 * Fetch all donations made by a specific user, newest-first.
 */
export async function getDonationsByUser(
    userId: string,
): Promise<Donation[]> {
    const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("donor_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Donation[];
}
