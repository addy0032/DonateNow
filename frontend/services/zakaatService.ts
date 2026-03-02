import { supabase } from "../lib/supabaseClient";

export interface ZakaatCalculation {
    id: string;
    user_id: string;
    total_assets: number;
    total_liabilities: number;
    net_amount: number;
    zakaat_due: number;
    created_at: string;
}

/**
 * Save a Zakaat calculation to the database.
 */
export async function saveZakaatCalculation(payload: {
    total_assets: number;
    total_liabilities: number;
    net_amount: number;
    zakaat_due: number;
}): Promise<ZakaatCalculation> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be signed in.");

    const { data, error } = await supabase
        .from("zakaat_calculations")
        .insert({
            user_id: user.id,
            total_assets: payload.total_assets,
            total_liabilities: payload.total_liabilities,
            net_amount: payload.net_amount,
            zakaat_due: payload.zakaat_due,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as ZakaatCalculation;
}

/**
 * Get Zakaat history for the current user.
 */
export async function getMyZakaatHistory(): Promise<ZakaatCalculation[]> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be signed in.");

    const { data, error } = await supabase
        .from("zakaat_calculations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as ZakaatCalculation[];
}
