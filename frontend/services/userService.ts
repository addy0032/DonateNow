import { supabase } from "../lib/supabaseClient";
import type { UpdateUserProfilePayload, UserProfile } from "../types/user";

/**
 * Fetch a user's profile by their auth user ID.
 */
export async function getUserProfile(
    userId: string,
): Promise<UserProfile> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return data as UserProfile;
}

/**
 * Update the currently authenticated user's profile.
 */
export async function updateUserProfile(
    userId: string,
    payload: UpdateUserProfilePayload,
): Promise<UserProfile> {
    const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;
    return data as UserProfile;
}
