import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type {
	CreateClientInput,
	CreateInterlocuteurInput,
	UpdateClientInput,
} from "@shared/schemas/client"

export type Interlocuteur = {
	id: string
	firstName: string
	lastName: string
	role: string | null
	phone: string | null
	email: string | null
	isPrimary: boolean
}

export type Client = {
	id: string
	name: string
	phone: string | null
	email: string | null
	notes: string | null
	addressId: string | null
	interlocuteurs?: Interlocuteur[]
}

export function useClients(search = "") {
	return useQuery({
		queryKey: queryKeys.clients.list({ q: search }),
		queryFn: async () => {
			const query: Record<string, string> = search ? { q: search } : {}
			const res = await api.api.clients.$get({ query })
			if (!res.ok) throw new Error("Failed to fetch clients")
			return res.json().then((d) => d.data as Client[])
		},
		staleTime: 60_000,
	})
}

export function useClient(id: string) {
	return useQuery({
		queryKey: queryKeys.clients.detail(id),
		queryFn: async () => {
			const res = await api.api.clients[":id"].$get({ param: { id } })
			if (!res.ok) throw new Error("Failed to fetch client")
			return res.json().then((d) => d.data as Client)
		},
	})
}

export function useCreateClient() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: CreateClientInput) => {
			const res = await api.api.clients.$post({ json: input })
			if (!res.ok) throw new Error("Failed to create client")
			return res.json().then((d) => d.data)
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients.all }),
	})
}

export function useUpdateClient(id: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: UpdateClientInput) => {
			const res = await api.api.clients[":id"].$patch({ param: { id }, json: input })
			if (!res.ok) throw new Error("Failed to update client")
			return res.json().then((d) => d.data)
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients.all }),
	})
}

export function useDeleteClient() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.api.clients[":id"].$delete({ param: { id } })
			if (!res.ok) throw new Error("Failed to delete client")
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients.all }),
	})
}

export function useAddInterlocuteur(clientId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: CreateInterlocuteurInput) => {
			const res = await api.api.clients[":id"].interlocuteurs.$post({
				param: { id: clientId },
				json: input,
			})
			if (!res.ok) throw new Error("Failed to add interlocuteur")
			return res.json().then((d) => d.data)
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients.detail(clientId) }),
	})
}
