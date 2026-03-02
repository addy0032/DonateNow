export type CampaignStatus = "pending" | "approved" | "rejected" | "completed";

export interface Campaign {
    id: string;
    title: string;
    description: string;
    goal_amount: number;
    raised_amount: number;
    status: CampaignStatus;
    image_url: string | null;
    created_by: string;
    organization_name: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCampaignPayload {
    title: string;
    description: string;
    goal_amount: number;
    image_url?: string;
    organization_name?: string;
}

export interface UpdateCampaignStatusPayload {
    status: CampaignStatus;
}
