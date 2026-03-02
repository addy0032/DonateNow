/**
 * Hardcoded role IDs matching the "roles" table in Supabase.
 * Replace the UUID placeholders with actual values from your database.
 */
export const ROLES = {
    ADMIN: "30728ff1-6307-4b4e-9740-870b1265d2ab",
    NGO: "d5f11050-59e2-4034-836d-73a3a9249ef0",
    DONOR: "83e7c28d-15c3-43f3-a0a2-f34b0c9c07cd",
} as const;

export type RoleKey = keyof typeof ROLES;
