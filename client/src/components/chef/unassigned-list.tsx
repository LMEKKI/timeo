import { useInterventions } from "@/hooks/use-interventions"
import { InterventionCard } from "@/components/shared/intervention-card"

export function UnassignedList() {
	const today = new Date().toISOString().slice(0, 10)
	const { data, isLoading } = useInterventions({ date: today, status: "unassigned" })

	if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />
	if (!data || data.length === 0) return <p className="text-sm text-muted-foreground">Aucune intervention non assignée.</p>

	return (
		<div className="space-y-2">
			{data.map((intervention) => (
				<InterventionCard key={intervention.id} intervention={intervention} />
			))}
		</div>
	)
}
