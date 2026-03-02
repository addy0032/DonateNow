"use client";

import clsx from "clsx";
import {
    BarChart3,
    CheckCircle,
    Heart,
    LayoutDashboard,
    Moon,
    PlusCircle,
    Search,
    Settings,
    Users,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/roles";
import { supabase } from "../lib/supabaseClient";

/* ------------------------------------------------------------------ */
/*  Role-based navigation definitions                                 */
/* ------------------------------------------------------------------ */

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const ADMIN_NAV: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/campaigns", label: "Approve Campaigns", icon: CheckCircle },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];

const NGO_NAV: NavItem[] = [
    { href: "/dashboard/my-campaigns", label: "My Campaigns", icon: LayoutDashboard },
    { href: "/dashboard/create-campaign", label: "Create Campaign", icon: PlusCircle },
    { href: "/dashboard/donations", label: "Donations", icon: Wallet },
];

const DONOR_NAV: NavItem[] = [
    { href: "/dashboard", label: "My Donations", icon: Heart },
    { href: "/explore", label: "Explore Campaigns", icon: Search },
    { href: "/dashboard/zakaat", label: "Zakaat History", icon: Moon },
];

function getNavForRole(roleId: string | null): NavItem[] {
    switch (roleId) {
        case ROLES.ADMIN:
            return ADMIN_NAV;
        case ROLES.NGO:
            return NGO_NAV;
        case ROLES.DONOR:
            return DONOR_NAV;
        default:
            return DONOR_NAV;
    }
}

function getRoleLabel(roleId: string | null): string {
    switch (roleId) {
        case ROLES.ADMIN:
            return "Admin";
        case ROLES.NGO:
            return "NGO";
        case ROLES.DONOR:
            return "Donor";
        default:
            return "User";
    }
}

/* ------------------------------------------------------------------ */
/*  Sidebar component                                                 */
/* ------------------------------------------------------------------ */

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [roleId, setRoleId] = useState<string | null>(null);

    // Fetch user's role from profiles table.
    useEffect(() => {
        if (!user) return;

        async function fetchRole() {
            const { data } = await supabase
                .from("profiles")
                .select("role_id")
                .eq("id", user!.id)
                .single();

            if (data?.role_id) setRoleId(data.role_id);
        }

        fetchRole();
    }, [user]);

    const navItems = getNavForRole(roleId);
    const roleLabel = getRoleLabel(roleId);

    return (
        <aside className="flex h-full w-64 shrink-0 flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {/* ---- Top: Brand ---- */}
            <div className="flex items-center gap-2.5 border-b border-neutral-100 px-5 py-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-sm text-white shadow-sm">
                    💚
                </span>
                <div>
                    <span className="text-sm font-bold tracking-tight text-neutral-900">
                        Donate<span className="text-primary-600">Now</span>
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold tracking-wider text-primary-600/70 uppercase">
                        {roleLabel} Panel
                    </span>
                </div>
            </div>

            {/* ---- Nav items ---- */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary-50 text-primary-700 shadow-sm"
                                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
                            )}
                        >
                            {/* Active indicator bar */}
                            <span
                                className={clsx(
                                    "h-5 w-[3px] rounded-full transition-all duration-200",
                                    isActive
                                        ? "bg-primary-500"
                                        : "bg-transparent group-hover:bg-neutral-300",
                                )}
                            />
                            <item.icon
                                className={clsx(
                                    "h-[18px] w-[18px] transition",
                                    isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600",
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* ---- Bottom: User + Settings ---- */}
            <div className="border-t border-neutral-100 px-3 py-4 space-y-1">
                <Link
                    href="/dashboard/settings"
                    className={clsx(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        pathname === "/dashboard/settings"
                            ? "bg-primary-50 text-primary-700 shadow-sm"
                            : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
                    )}
                >
                    <span
                        className={clsx(
                            "h-5 w-[3px] rounded-full transition-all duration-200",
                            pathname === "/dashboard/settings"
                                ? "bg-primary-500"
                                : "bg-transparent group-hover:bg-neutral-300",
                        )}
                    />
                    <Settings className="h-[18px] w-[18px] text-neutral-400 transition group-hover:text-neutral-600" />
                    Settings
                </Link>

                <button
                    type="button"
                    onClick={() => signOut()}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                >
                    <span className="h-5 w-[3px] rounded-full bg-transparent transition group-hover:bg-red-300" />
                    <svg
                        className="h-[18px] w-[18px] text-neutral-400 transition group-hover:text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
}
