import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"

type Stats = {
	total: number
	completed: number
	inProgress: number
	late: number
	techs: number
	completionRate: number
}

type ActivityItem = {
	id: string
	content: string
	createdAt: string
	interventionId: string
	authorName: string | null
}

export function useDashboardStats() {
	return useQuery({
		queryKey: queryKeys.dashboard.stats(),
		queryFn: async () => {
			const res = await api.api.dashboard.stats.$get()
			if (!res.ok) throw new Error("Failed to fetch stats")
			return res.json().then((d) => d.data as Stats)
		},
		refetchInterval: 10_000,
	})
}

export function useDashboardActivity() {
	return useQuery({
		queryKey: queryKeys.dashboard.activity(),
		queryFn: async () => {
			const res = await api.api.dashboard.activity.$get()
			if (!res.ok) throw new Error("Failed to fetch activity")
			return res.json().then((d) => d.data as ActivityItem[])
		},
		refetchInterval: 10_000,
	})
}
