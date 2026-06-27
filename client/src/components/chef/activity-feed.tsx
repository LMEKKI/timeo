import { useDashboardActivity } from "@/hooks/use-dashboard"

function formatTime(dateStr: string): string {
	return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

export function ActivityFeed() {
	const { data, isLoading } = useDashboardActivity()

	if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />
	if (!data || data.length === 0) return <p className="text-sm text-muted-foreground">Aucune activité récente.</p>

	return (
		<div className="space-y-2">
			{data.slice(0, 10).map((item) => (
				<div key={item.id} className="flex gap-3 text-sm">
					<span className="w-12 shrink-0 text-xs text-muted-foreground">{formatTime(item.createdAt)}</span>
					<div className="flex-1">
						<span className="font-medium">{item.authorName ?? "?"}</span>
						<span className="text-muted-foreground"> : {item.content}</span>
					</div>
				</div>
			))}
		</div>
	)
}
