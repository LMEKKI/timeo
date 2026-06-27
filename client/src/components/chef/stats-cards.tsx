import { useDashboardStats } from "@/hooks/use-dashboard"

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className={`mt-1 text-3xl font-semibold ${color}`}>{value}</p>
		</div>
	)
}

export function StatsCards() {
	const { data, isLoading } = useDashboardStats()

	if (isLoading || !data) {
		return (
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{["s1", "s2", "s3", "s4"].map((k) => (
					<div key={k} className="h-24 animate-pulse rounded-lg bg-muted" />
				))}
			</div>
		)
	}

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			<StatCard label="Interventions" value={data.total} color="text-foreground" />
			<StatCard label="Terminées" value={data.completed} color="text-success" />
			<StatCard label="En cours" value={data.inProgress} color="text-warning" />
			<StatCard label="En retard" value={data.late} color="text-destructive" />
		</div>
	)
}
