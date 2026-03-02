import { supabase } from "../lib/supabaseClient";
import type { CreateDonationPayload, Donation } from "../types/donation";

/**
 * Create a new donation and update the campaign's current_amount.
 * The `donor_id` is set to the currently authenticated user.
 */
export async function createDonation(
    payload: CreateDonationPayload,
): Promise<Donation> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be signed in to make a donation.");

    // 1. Insert the donation row.
    const { data, error } = await supabase
        .from("donations")
        .insert({
            amount: payload.amount,
            campaign_id: payload.campaign_id,
            donor_id: user.id,
            is_anonymous: payload.is_anonymous ?? false,
            is_zakaat: payload.is_zakaat ?? false,
            message: payload.message ?? null,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // 2. Update campaign current_amount via RPC or manual increment.
    const { error: updateErr } = await supabase.rpc("increment_campaign_amount", {
        cid: payload.campaign_id,
        donation_amount: payload.amount,
    });

    // Fallback: if the RPC doesn't exist, do a manual read‑then‑write.
    if (updateErr) {
        const { data: campaign } = await supabase
            .from("campaigns")
            .select("current_amount")
            .eq("id", payload.campaign_id)
            .single();

        if (campaign) {
            await supabase
                .from("campaigns")
                .update({
                    current_amount: (campaign.current_amount ?? 0) + payload.amount,
                })
                .eq("id", payload.campaign_id);
        }
    }

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

    if (error) throw new Error(error.message);
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

    if (error) throw new Error(error.message);
    return (data ?? []) as Donation[];
}
