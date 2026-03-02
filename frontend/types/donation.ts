export interface Donation {
    id: string;
    amount: number;
    campaign_id: string;
    donor_id: string;
    is_anonymous: boolean;
    is_zakaat: boolean;
    message: string | null;
    created_at: string;
}

export interface CreateDonationPayload {
    amount: number;
    campaign_id: string;
    message?: string;
    is_anonymous?: boolean;
    is_zakaat?: boolean;
}
