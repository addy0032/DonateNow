import { supabase } from "./supabaseClient";

const BUCKET = "campaign-images";

/* ------------------------------------------------------------------ */
/*  Upload a campaign banner image                                    */
/* ------------------------------------------------------------------ */

/**
 * Uploads a file to the "campaign-images" Supabase Storage bucket.
 * Returns the stored file path (not the full URL).
 *
 * @param file - The image File object
 * @param userId - The authenticated user's ID (used in the path for uniqueness)
 */
export async function uploadCampaignImage(
    file: File,
    userId: string,
): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const timestamp = Date.now();
    const path = `${userId}/${timestamp}.${ext}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) throw new Error(`Upload failed: ${error.message}`);
    return path;
}

/* ------------------------------------------------------------------ */
/*  Get public URL for a stored image                                 */
/* ------------------------------------------------------------------ */

/**
 * Returns the public URL for a file stored in the "campaign-images" bucket.
 *
 * @param path - The file path returned by `uploadCampaignImage`
 */
export function getCampaignImageUrl(path: string): string {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}
