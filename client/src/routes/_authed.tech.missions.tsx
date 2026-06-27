import { createFileRoute, Link } from "@tanstack/react-router"
import { Clock, Users } from "lucide-react"
import { useInterventions } from "@/hooks/use-interventions"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { useAuth } from "@/lib/auth-client"

export const Route = createFileRoute("/_authed/tech/missions")({
	component: MissionsPage,
})

function MissionsPage() {
	const { user } = useAuth()
	const today = new Date().toISOString().slice(0, 10)
	const { data, isLoading } = useInterventions({ date: today })

	if (user?.role === "tech" && user.availabilityStatus === "absent") {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground">
					Vous êtes marqué absent. Contactez le chef pour reprendre.
				</p>
			</div>
		)
	}

	return (
		<div className="p-4 pb-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold">Missions du jour</h1>
				<p className="text-sm text-muted-foreground">
					{new Date().toLocaleDateString("fr-FR", {
						weekday: "short",
						day: "numeric",
						month: "short",
					})}
				</p>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{["m1", "m2", "m3"].map((k) => (
						<div key={k} className="h-24 animate-pulse rounded-lg bg-muted" />
					))}
				</div>
			) : !data || data.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-6 text-center">
					<p className="text-muted-foreground">Aucune mission aujourd'hui.</p>
				</div>
			) : (
				<div className="space-y-2">
					{data.map((intervention) => {
						const isMulti = (intervention.assignees?.length ?? 0) > 1
						return (
							<Link
								key={intervention.id}
								to="/tech/mission-detail/$id"
								params={{ id: intervention.id }}
								className="block rounded-lg border border-border bg-card p-4 transition-colors active:bg-accent"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 space-y-1">
										<div className="flex items-center gap-2">
											<h2 className="font-medium">{intervention.title}</h2>
											{isMulti && <Users size={12} className="text-primary" />}
										</div>
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<Clock size={12} />
											{intervention.startTime}
										</div>
									</div>
									<div className="flex flex-col items-end gap-1">
										<StatusBadge status={intervention.status} />
										<PriorityBadge priority={intervention.priority ?? null} />
									</div>
								</div>
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}
