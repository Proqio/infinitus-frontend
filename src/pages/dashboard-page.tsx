export function DashboardPage() {
    const stats = [
        { label: 'Total Scans', value: '128', description: 'All-time assessments' },
        { label: 'Critical Findings', value: '14', description: 'Requires immediate action' },
        { label: 'Providers Connected', value: '5', description: 'AWS, Azure, GCP, K8s, GitHub' },
        { label: 'Last Scan', value: '2h ago', description: 'Most recent assessment' },
    ];

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                    Overview of your cloud security posture
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, description }) => (
                    <div
                        key={label}
                        className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm"
                    >
                        <p className="text-muted-foreground text-sm font-medium">{label}</p>
                        <p className="mt-1 text-3xl font-bold">{value}</p>
                        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
                    </div>
                ))}
            </div>

            <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Recent Findings</h2>
                <p className="text-muted-foreground text-sm">No recent findings to display.</p>
            </div>
        </div>
    );
}
