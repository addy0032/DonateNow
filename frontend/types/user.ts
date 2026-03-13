export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role_id: string;
    organization_name: string | null;
    avatar_url: string | null;
    ngo_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface UpdateUserProfilePayload {
    full_name?: string;
    avatar_url?: string;
    organization_name?: string;
}
