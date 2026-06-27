import { createFileRoute } from "@tanstack/react-router"
import { Clock, ListChecks, TrendingUp } from "lucide-react"
import { StatsCards } from "@/components/chef/stats-cards"
import { ActivityFeed } from "@/components/chef/activity-feed"
import { UnassignedList } from "@/components/chef/unassigned-list"

export const Route = createFileRoute("/_authed/chef/dashboard")({
	component: DashboardPage,
})

function DashboardPage() {
	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Clock size={16} />
					{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
				</div>
			</div>

			<section>
				<h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<TrendingUp size={14} />AUJOURD'HUI
				</h2>
				<StatsCards />
			</section>

			<div className="grid gap-6 lg:grid-cols-2">
				<section>
					<h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<ListChecks size={14} />NON ASSIGNÉES
					</h2>
					<UnassignedList />
				</section>
				<section>
					<h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
						ACTIVITÉ RÉCENTE
					</h2>
					<ActivityFeed />
				</section>
			</div>
		</div>
	)
}
