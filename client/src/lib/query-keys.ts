export const queryKeys = {
	auth: { session: () => ["auth", "session"] as const },
	interventions: {
		all: ["interventions"] as const,
		lists: () => [...queryKeys.interventions.all, "list"] as const,
		list: (filters: { date?: string; status?: string }) =>
			[...queryKeys.interventions.lists(), filters] as const,
		details: () => [...queryKeys.interventions.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.interventions.details(), id] as const,
	},
	clients: {
		all: ["clients"] as const,
		lists: () => [...queryKeys.clients.all, "list"] as const,
		list: (filters: { q?: string }) => [...queryKeys.clients.lists(), filters] as const,
		details: () => [...queryKeys.clients.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.clients.details(), id] as const,
	},
	users: {
		all: ["users"] as const,
		list: () => [...queryKeys.users.all, "list"] as const,
	},
	dashboard: {
		stats: () => ["dashboard", "stats"] as const,
		activity: () => ["dashboard", "activity"] as const,
	},
} as const
