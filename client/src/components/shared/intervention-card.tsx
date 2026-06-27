import { Link } from "@tanstack/react-router"
import { Clock, MapPin } from "lucide-react"
import { PriorityBadge } from "./priority-badge"
import { StatusBadge } from "./status-badge"
import { MultiAssignBadge } from "./multi-assign-badge"

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

export function InterventionCard({ intervention }: { intervention: Intervention }) {
	const isMulti = (intervention.assignees?.length ?? 0) > 1

	return (
		<Link
			to="/chef/intervention-detail/$id"
			params={{ id: intervention.id }}
			className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 space-y-1">
					<div className="flex items-center gap-2">
						<h3 className="font-medium text-foreground">{intervention.title}</h3>
						{isMulti && <MultiAssignBadge />}
					</div>
					{intervention.clientName && (
						<p className="text-sm text-muted-foreground">{intervention.clientName}</p>
					)}
					{intervention.address && (
						<p className="flex items-center gap-1 text-xs text-muted-foreground">
							<MapPin size={12} />
							{intervention.address}
						</p>
					)}
				</div>
				<div className="flex flex-col items-end gap-1">
					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<Clock size={12} />
						{intervention.startTime}
					</div>
					<div className="flex gap-1">
						<StatusBadge status={intervention.status} />
						<PriorityBadge priority={intervention.priority ?? null} />
					</div>
				</div>
			</div>
		</Link>
	)
}
