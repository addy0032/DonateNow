export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Dashboard
            </h1>
            <p className="mt-2 text-neutral-500">
                Welcome to your DonateNow dashboard. Select an option from the sidebar
                to get started.
            </p>

            {/* Placeholder cards */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                    { label: "Total Donations", value: "—", color: "bg-primary-50 text-primary-600" },
                    { label: "Active Campaigns", value: "—", color: "bg-accent-50 text-accent-600" },
                    { label: "Verified Users", value: "—", color: "bg-emerald-50 text-emerald-600" },
                ].map((stat) => (
                    <div key={stat.label} className="card p-6">
                        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                            {stat.label}
                        </p>
                        <p className={`mt-2 text-3xl font-bold ${stat.color.split(" ")[1]}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
