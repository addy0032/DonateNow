import { ROLES } from "./roles";
import { supabase } from "./supabaseClient";
import type { Profile, SignUpPayload } from "./types";

// ---------------------------------------------------------------------------
// Profile helpers
// ---------------------------------------------------------------------------

/**
 * Insert a row into the "profiles" table for a newly registered user.
 *
 * @param userId  - The auth user ID returned by Supabase sign-up.
 * @param email   - The user's email address.
 * @param fullName - User's full name.
 * @param roleId  - Role UUID from {@link ROLES}.
 * @param organizationName - Required for NGO users; ignored otherwise.
 */
export async function createProfile(
    userId: string,
    email: string,
    fullName: string,
    roleId: string,
    organizationName?: string,
): Promise<Profile> {
    const { data, error } = await supabase
        .from("profiles")
        .insert({
            id: userId,
            full_name: fullName,
            email,
            role_id: roleId,
            organization_name: organizationName ?? null,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Profile;
}

// ---------------------------------------------------------------------------
// Auth actions
// ---------------------------------------------------------------------------

/**
 * Sign up a new user with email & password, then create their profile row.
 *
 * - If `role` is `"NGO"`, `organizationName` is required.
 * - Defaults to the `DONOR` role when no role is specified.
 */
export async function signUp(payload: SignUpPayload) {
    const { email, password, fullName, role, organizationName } = payload;

    // Validate NGO-specific requirement.
    if (role === "NGO" && !organizationName) {
        throw new Error("Organization name is required for NGO sign-ups.");
    }

    // 1. Create the auth user.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        throw authError;
    }

    const user = authData.user;

    if (!user) {
        throw new Error("Sign-up succeeded but no user was returned.");
    }

    // 2. Insert the profile row.
    const roleId = ROLES[role] ?? ROLES.DONOR;

    try {
        const profile = await createProfile(
            user.id,
            user.email ?? email,
            fullName,
            roleId,
            role === "NGO" ? organizationName : undefined,
        );

        return { user, profile };
    } catch (profileError) {
        // Surface a clear message without crashing the app.
        console.error("Failed to create profile after sign-up:", profileError);
        throw new Error(
            "Account was created but profile setup failed. Please contact support.",
        );
    }
}

/**
 * Sign in an existing user with email and password.
 */
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Sign out the currently authenticated user.
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}
