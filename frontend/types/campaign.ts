export type CampaignStatus = "pending" | "approved" | "rejected";

/** Matches the `campaigns` table in Supabase. */
export interface Campaign {
    id: string;
    title: string;
    description: string;
    target_amount: number;
    current_amount: number;
    status: CampaignStatus;
    image_url: string | null;
    category: string;
    is_zakaat: boolean;
    creator_id: string;
    organization_name: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCampaignPayload {
    title: string;
    description: string;
    target_amount: number;
    image_url?: string;
    organization_name?: string;
    category?: string;
    is_zakaat?: boolean;
}

export interface UpdateCampaignStatusPayload {
    status: CampaignStatus;
}
