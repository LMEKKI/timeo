export const STATUS_LABEL_FR = {
	unassigned: "Non assigné",
	planned: "Planifié",
	started: "Démarré",
	completed: "Terminé",
	cancelled: "Annulé",
} as const

export const PRIORITY_LABEL_FR = {
	low: "Basse",
	high: "Haute",
	urgent: "Urgente",
} as const

export const AVAILABILITY_LABEL_FR = {
	available: "Disponible",
	on_mission: "En mission",
	absent: "Absent",
} as const

export const STATUS_COLOR: Record<keyof typeof STATUS_LABEL_FR, string> = {
	unassigned: "bg-status-unassigned/15 text-status-unassigned",
	planned: "bg-status-planned/20 text-status-planned",
	started: "bg-status-started/20 text-status-started",
	completed: "bg-status-completed/20 text-status-completed",
	cancelled: "bg-status-cancelled/20 text-status-cancelled",
}

export const PRIORITY_COLOR: Record<keyof typeof PRIORITY_LABEL_FR, string> = {
	low: "bg-muted text-muted-foreground",
	high: "bg-accent text-accent-foreground",
	urgent: "bg-destructive/15 text-destructive",
}
