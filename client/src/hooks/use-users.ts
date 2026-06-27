import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { CreateTechInput } from "@shared/schemas/user"

type Tech = {
	id: string
	name: string
	username: string
	role: "chef" | "tech"
	availabilityStatus: "available" | "on_mission" | "absent"
	email: string | null
}

export function useUsers() {
	return useQuery({
		queryKey: queryKeys.users.list(),
		queryFn: async () => {
			const res = await api.api.users.$get()
			if (!res.ok) throw new Error("Failed to fetch users")
			return res.json().then((d) => d.data as Tech[])
		},
		staleTime: 60_000,
	})
}

export function useCreateUser() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: CreateTechInput) => {
			const res = await api.api.users.$post({ json: input })
			if (!res.ok) throw new Error("Failed to create user")
			return res.json().then((d) => d.data)
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
	})
}
