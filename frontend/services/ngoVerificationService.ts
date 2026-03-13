import { supabase } from "../lib/supabaseClient";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type DocumentType = "registration_certificate" | "tax_exemption" | "identity_proof";
export type DocumentStatus = "pending" | "approved" | "rejected";

export interface NgoDocument {
    id: string;
    user_id: string;
    document_type: DocumentType;
    document_path: string;
    status: DocumentStatus;
    created_at: string;
}

export interface NgoVerificationRow extends NgoDocument {
    organization_name?: string;
    full_name?: string;
    email?: string;
}

const BUCKET = "ngo-documents";

/* ------------------------------------------------------------------ */
/*  Upload a document                                                 */
/* ------------------------------------------------------------------ */

export async function uploadNgoDocument(
    file: File,
    userId: string,
    docType: DocumentType,
): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `${userId}/${docType}_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) throw new Error(`Upload failed: ${error.message}`);
    return path;
}

/* ------------------------------------------------------------------ */
/*  Save document metadata                                            */
/* ------------------------------------------------------------------ */

export async function saveDocumentMetadata(
    userId: string,
    docType: DocumentType,
    docPath: string,
): Promise<void> {
    const { error } = await supabase.from("ngo_documents").insert({
        user_id: userId,
        document_type: docType,
        document_path: docPath,
        status: "pending",
    });
    if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/*  Get my documents                                                  */
/* ------------------------------------------------------------------ */

export async function getMyDocuments(): Promise<NgoDocument[]> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in.");

    const { data, error } = await supabase
        .from("ngo_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as NgoDocument[];
}

/* ------------------------------------------------------------------ */
/*  Get all pending verifications (admin)                             */
/* ------------------------------------------------------------------ */

export async function getAllPendingVerifications(): Promise<NgoVerificationRow[]> {
    // Fetch documents
    const { data: docs, error } = await supabase
        .from("ngo_documents")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!docs || docs.length === 0) return [];

    // Fetch profiles for all unique user_ids
    const userIds = [...new Set(docs.map((d: Record<string, unknown>) => d.user_id as string))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, organization_name")
        .in("id", userIds);

    const profileMap = new Map(
        (profiles ?? []).map((p: Record<string, unknown>) => [p.id as string, p]),
    );

    return docs.map((row: Record<string, unknown>) => {
        const profile = profileMap.get(row.user_id as string) as Record<string, string> | undefined;
        return {
            id: row.id as string,
            user_id: row.user_id as string,
            document_type: row.document_type as DocumentType,
            document_path: row.document_path as string,
            status: row.status as DocumentStatus,
            created_at: row.created_at as string,
            organization_name: profile?.organization_name ?? "—",
            full_name: profile?.full_name ?? "Unknown",
            email: profile?.email ?? "—",
        };
    });
}

/* ------------------------------------------------------------------ */
/*  Approve / reject                                                  */
/* ------------------------------------------------------------------ */

export async function updateDocumentStatus(
    docId: string,
    status: "approved" | "rejected",
): Promise<void> {
    const { error } = await supabase
        .from("ngo_documents")
        .update({ status })
        .eq("id", docId);
    if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/*  Mark NGO as verified                                              */
/* ------------------------------------------------------------------ */

export async function setNgoVerified(userId: string, verified: boolean): Promise<void> {
    const { error } = await supabase
        .from("profiles")
        .update({ ngo_verified: verified })
        .eq("id", userId);
    if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/*  Get a signed download URL (private bucket)                        */
/* ------------------------------------------------------------------ */

export async function getDocumentSignedUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 300); // 5 min expiry

    if (error) throw new Error(error.message);
    return data.signedUrl;
}
