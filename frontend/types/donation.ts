export interface Donation {
    id: string;
    amount: number;
    campaign_id: string;
    donor_id: string;
    message: string | null;
    created_at: string;
}

export interface CreateDonationPayload {
    amount: number;
    campaign_id: string;
    message?: string;
}
