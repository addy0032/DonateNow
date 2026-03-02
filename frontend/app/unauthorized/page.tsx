import Link from "next/link";

export const metadata = {
    title: "Unauthorized | DonateNow",
    description: "You do not have permission to view this page.",
};

export default function UnauthorizedPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-50 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                🚫
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                Access Denied
            </h1>

            <p className="max-w-sm text-neutral-500">
                You don&apos;t have permission to access this page. If you believe this
                is a mistake, please contact the site administrator.
            </p>

            <div className="flex gap-3">
                <Link href="/" className="btn-primary">
                    Go Home
                </Link>
                <Link href="/login" className="btn-secondary">
                    Sign In
                </Link>
            </div>
        </main>
    );
}
