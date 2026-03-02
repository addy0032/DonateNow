"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    signIn as authSignIn,
    signOut as authSignOut,
    signUp as authSignUp,
} from "../lib/auth";
import { supabase } from "../lib/supabaseClient";
import type { SignUpPayload } from "../lib/types";

interface AuthContextValue {
    /** The current Supabase user, or null if not authenticated. */
    user: User | null;
    /** The current Supabase session, or null if not authenticated. */
    session: Session | null;
    /** Whether the initial auth state is still loading. */
    loading: boolean;
    /** Sign up a new user with profile creation. */
    signUp: (payload: SignUpPayload) => Promise<void>;
    /** Sign in an existing user. */
    signIn: (email: string, password: string) => Promise<void>;
    /** Sign out the current user. */
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the initial session on mount.
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Subscribe to auth state changes (sign-in, sign-out, token refresh, etc.).
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignUp = useCallback(async (payload: SignUpPayload) => {
        await authSignUp(payload);
    }, []);

    const handleSignIn = useCallback(async (email: string, password: string) => {
        await authSignIn(email, password);
    }, []);

    const handleSignOut = useCallback(async () => {
        await authSignOut();
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            session,
            loading,
            signUp: handleSignUp,
            signIn: handleSignIn,
            signOut: handleSignOut,
        }),
        [user, session, loading, handleSignUp, handleSignIn, handleSignOut],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state and actions.
 * Must be used within an `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
