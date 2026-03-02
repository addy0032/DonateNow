import { type NextRequest, NextResponse } from "next/server";
import { ROLES } from "./lib/roles";
import { createMiddlewareClient } from "./lib/supabaseMiddleware";

// ---------- Route → Role mapping ----------

/** Maps a path prefix to the role ID(s) that are allowed to access it. */
const PROTECTED_ROUTES: Record<string, string[]> = {
    "/admin": [ROLES.ADMIN],
    "/ngo": [ROLES.ADMIN, ROLES.NGO],
    "/donor": [ROLES.ADMIN, ROLES.DONOR],
    "/dashboard": [ROLES.ADMIN, ROLES.NGO, ROLES.DONOR],
};

/** Routes that should never be intercepted (avoids redirect loops). */
const PUBLIC_PATHS = ["/login", "/signup", "/register", "/unauthorized"];

// ---------- Middleware ----------

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Skip public routes to avoid infinite redirects.
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // 2. Determine if the request hits a protected prefix.
    const matchedPrefix = Object.keys(PROTECTED_ROUTES).find((prefix) =>
        pathname.startsWith(prefix),
    );

    if (!matchedPrefix) {
        // Route is not protected — let it through.
        return NextResponse.next();
    }

    // 3. Get the Supabase session.
    const { supabase, res } = createMiddlewareClient(req);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // Not logged in → redirect to /login.
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Fetch the user's role from the profiles table.
    const { data: profile } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", user.id)
        .single();

    const userRoleId = profile?.role_id as string | undefined;

    // 5. Check if the user's role is allowed on this route.
    const allowedRoles = PROTECTED_ROUTES[matchedPrefix];

    if (!userRoleId || !allowedRoles.includes(userRoleId)) {
        const unauthorizedUrl = req.nextUrl.clone();
        unauthorizedUrl.pathname = "/unauthorized";
        return NextResponse.redirect(unauthorizedUrl);
    }

    // 6. Authorised — continue (with refreshed cookie headers).
    return res;
}

// ---------- Matcher ----------

export const config = {
    matcher: ["/admin/:path*", "/ngo/:path*", "/donor/:path*", "/dashboard/:path*"],
};
