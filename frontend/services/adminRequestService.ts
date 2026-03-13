import { supabase } from "../lib/supabaseClient";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface AdminRequest {
    id: string;
    user_id: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    // joined profile fields
    full_name?: string;
    email?: string;
}

/* ------------------------------------------------------------------ */
/*  Submit a request                                                  */
/* ------------------------------------------------------------------ */

export async function submitAdminRequest(reason: string): Promise<void> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be signed in.");

    const { error } = await supabase.from("admin_requests").insert({
        user_id: user.id,
        reason,
    });

    if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/*  Get all requests (admin)                                          */
/* ------------------------------------------------------------------ */

export async function getAllAdminRequests(): Promise<AdminRequest[]> {
    const { data, error } = await supabase
        .from("admin_requests")
        .select("*, profiles:user_id(full_name, email)")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Flatten the joined profile data
    return (data ?? []).map((r: Record<string, unknown>) => {
        const profile = r.profiles as Record<string, string> | null;
        return {
            id: r.id as string,
            user_id: r.user_id as string,
            reason: r.reason as string,
            status: r.status as AdminRequest["status"],
            created_at: r.created_at as string,
            full_name: profile?.full_name ?? "Unknown",
            email: profile?.email ?? "—",
        };
    }) as AdminRequest[];
}

/* ------------------------------------------------------------------ */
/*  Update request status                                             */
/* ------------------------------------------------------------------ */

export async function updateAdminRequestStatus(
    requestId: string,
    status: "approved" | "rejected",
): Promise<void> {
    const { error } = await supabase
        .from("admin_requests")
        .update({ status })
        .eq("id", requestId);

    if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/*  Promote user to admin                                             */
/* ------------------------------------------------------------------ */

export async function promoteToAdmin(userId: string): Promise<void> {
    // Look up the admin role_id from the roles table
    const { data: role, error: roleErr } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "admin")
        .single();

    if (roleErr || !role) {
        // Fallback: try common admin role names
        const { data: role2 } = await supabase
            .from("roles")
            .select("id")
            .ilike("name", "%admin%")
            .single();

        if (!role2) throw new Error("Admin role not found in roles table.");

        const { error } = await supabase
            .from("profiles")
            .update({ role_id: role2.id })
            .eq("id", userId);

        if (error) throw new Error(error.message);
        return;
    }

    const { error } = await supabase
        .from("profiles")
        .update({ role_id: role.id })
        .eq("id", userId);

    if (error) throw new Error(error.message);
}
