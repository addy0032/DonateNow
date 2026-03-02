"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

interface AuthGuardProps {
    children: React.ReactNode;
    /** Optional list of allowed role IDs. If empty, any authenticated user is allowed. */
    allowedRoles?: string[];
}

/**
 * Client-side route protection.
 *
 * Wraps protected pages — redirects to `/login` if not authenticated,
 * or `/unauthorized` if the user's role is not in `allowedRoles`.
 */
export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [roleChecked, setRoleChecked] = useState(false);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Not logged in → redirect to login.
        if (!user) {
            router.replace(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        // If no role restriction, allow any authenticated user.
        if (!allowedRoles || allowedRoles.length === 0) {
            setAuthorized(true);
            setRoleChecked(true);
            return;
        }

        // Fetch role and check.
        async function checkRole() {
            const { data } = await supabase
                .from("profiles")
                .select("role_id")
                .eq("id", user!.id)
                .single();

            if (data?.role_id && allowedRoles!.includes(data.role_id)) {
                setAuthorized(true);
            } else {
                router.replace("/unauthorized");
            }
            setRoleChecked(true);
        }

        checkRole();
    }, [user, loading, allowedRoles, router]);

    // Show loading state while checking auth.
    if (loading || !roleChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-neutral-200 border-t-primary-600" />
                    <p className="text-sm text-neutral-400">Checking access…</p>
                </div>
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
