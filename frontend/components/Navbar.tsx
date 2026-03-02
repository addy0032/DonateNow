"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
    { href: "/campaigns", label: "Explore" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/zakaat", label: "Zakaat" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { user, loading, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Close mobile menu on route change.
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Track scroll to add shadow + stronger background.
    useEffect(() => {
        function handleScroll() {
            setScrolled(window.scrollY > 10);
        }
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={clsx(
                "sticky top-0 z-50 w-full border-b backdrop-blur-lg transition-all duration-300",
                scrolled
                    ? "border-neutral-200/80 bg-white/80 shadow-sm"
                    : "border-transparent bg-white/60",
            )}
        >
            <nav className="section-container flex h-16 items-center justify-between">
                {/* ---- Left: Logo ---- */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm text-white shadow-sm">
                        💚
                    </span>
                    <span className="text-lg font-bold tracking-tight text-neutral-900">
                        Donate<span className="text-primary-600">Now</span>
                    </span>
                </Link>

                {/* ---- Center: Nav links (desktop) ---- */}
                <ul className="hidden items-center gap-1 md:flex">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={clsx(
                                    "relative px-4 py-2 text-sm font-medium transition",
                                    pathname === link.href
                                        ? "text-primary-600"
                                        : "text-neutral-500 hover:text-neutral-900",
                                    // Underline animation
                                    "after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary-500 after:transition-all after:duration-300",
                                    pathname === link.href
                                        ? "after:w-5"
                                        : "hover:after:w-5",
                                )}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* ---- Right: Auth buttons (desktop) ---- */}
                <div className="hidden items-center gap-2 md:flex">
                    {loading ? (
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-neutral-100" />
                    ) : user ? (
                        <>
                            <Link href="/dashboard" className="btn-secondary py-2 text-xs">
                                Dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={() => signOut()}
                                className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
                            >
                                Login
                            </Link>
                            <Link href="/register" className="btn-primary py-2 text-xs">
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* ---- Hamburger (mobile) ---- */}
                <button
                    type="button"
                    onClick={() => setMobileOpen((p) => !p)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </nav>

            {/* ---- Mobile menu ---- */}
            {mobileOpen && (
                <div className="animate-[fadeSlideDown_0.2s_ease-out] border-t border-neutral-100 bg-white/95 backdrop-blur-xl md:hidden">
                    <div className="section-container flex flex-col gap-1 py-4">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    "rounded-lg px-4 py-2.5 text-sm font-medium transition",
                                    pathname === link.href
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-neutral-600 hover:bg-neutral-50",
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <hr className="my-2 border-neutral-100" />

                        {loading ? null : user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => signOut()}
                                    className="rounded-lg px-4 py-2.5 text-left text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="btn-primary mt-1 w-full justify-center py-2.5 text-sm"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
