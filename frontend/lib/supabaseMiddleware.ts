import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Create a Supabase client that runs in Next.js middleware / edge context.
 *
 * It reads cookies from the incoming request and writes any refreshed tokens
 * back via `NextResponse` cookie headers so the session stays alive.
 */
export function createMiddlewareClient(req: NextRequest) {
    let res = NextResponse.next({ request: req });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    for (const { name, value, options } of cookiesToSet) {
                        req.cookies.set(name, value);
                    }

                    res = NextResponse.next({ request: req });

                    for (const { name, value, options } of cookiesToSet) {
                        res.cookies.set(name, value, options);
                    }
                },
            },
        },
    );

    return { supabase, res };
}
