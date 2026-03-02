import DashboardSidebar from "../../components/DashboardSidebar";

export const metadata = {
    title: "Dashboard | DonateNow",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-neutral-50">
            {/* Sidebar — fixed width, full height */}
            <div className="hidden p-4 md:block">
                <div className="sticky top-4 h-[calc(100vh-2rem)]">
                    <DashboardSidebar />
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
