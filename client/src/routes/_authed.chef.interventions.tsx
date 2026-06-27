import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { Search } from "lucide-react"
import { useInterventions } from "@/hooks/use-interventions"
import { InterventionCard } from "@/components/shared/intervention-card"

type Intervention = {
	id: string
	title: string
	date: string
	startTime: string
	status: "unassigned" | "planned" | "started" | "completed" | "cancelled"
	priority?: "low" | "high" | "urgent" | null
	assignees?: Array<{ userId: string }>
	clientName?: string
	address?: string
}

const searchSchema = z.object({
	status: z.enum(["unassigned", "planned", "started", "completed", "cancelled"]).optional().catch(() => undefined),
	date: z.string().optional().catch(() => undefined),
})

export const Route = createFileRoute("/_authed/chef/interventions")({
	validateSearch: searchSchema,
	component: InterventionsListPage,
})

function InterventionsListPage() {
	const search = Route.useSearch()
	const navigate = useNavigate({ from: Route.fullPath })
	const { data, isLoading } = useInterventions({ date: search.date, status: search.status })

	return (
		<div className="space-y-4 p-6">
			<h1 className="text-2xl font-semibold">Interventions</h1>

			<div className="flex flex-wrap gap-2">
				<div className="relative flex-1 min-w-50">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<input
						type="date"
						value={search.date ?? ""}
						onChange={(e) => navigate({ search: { ...search, date: e.target.value || undefined } })}
						className="w-full rounded border border-input bg-background pl-9 pr-3 py-2 text-sm"
					/>
				</div>
				<select
					value={search.status ?? ""}
					onChange={(e) => navigate({ search: { ...search, status: (e.target.value || undefined) as typeof search.status } })}
					className="rounded border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="">Tous les statuts</option>
					<option value="unassigned">Non assigné</option>
					<option value="planned">Planifié</option>
					<option value="started">Démarré</option>
					<option value="completed">Terminé</option>
					<option value="cancelled">Annulé</option>
				</select>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
						<div key={k} className="h-20 animate-pulse rounded-lg bg-muted" />
					))}
				</div>
			) : !data || data.length === 0 ? (
				<p className="text-sm text-muted-foreground">Aucune intervention.</p>
			) : (
				<div className="space-y-2">
					{data.map((intervention: Intervention) => (
						<InterventionCard key={intervention.id} intervention={intervention} />
					))}
				</div>
			)}
		</div>
	)
}
