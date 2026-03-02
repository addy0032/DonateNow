import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.",
    );
}

/**
 * Browser-side Supabase client.
 *
 * Uses `createBrowserClient` from `@supabase/ssr` so the session is
 * stored in **cookies** (not localStorage). This is critical because
 * the Next.js middleware also reads cookies to verify authentication.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
