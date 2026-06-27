import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type {
	AssignTechInput,
	CreateInterventionInput,
	CreateNoteInput,
	TransitionInterventionInput,
	UpdateInterventionInput,
} from "@shared/schemas/intervention"

type InterventionListItem = {
	id: string
	title: string
	date: string
	startTime: string
	status: "unassigned" | "planned" | "started" | "completed" | "cancelled"
	priority: "low" | "high" | "urgent" | null
	clientId: string
	description: string | null
	assignees?: Array<{ userId: string }>
}

type InterventionDetail = InterventionListItem & {
	chefNote: string | null
	assignees: Array<{ userId: string }>
	notes: Array<{ id: string; content: string; createdAt: string; authorName: string | null }>
}

export function useInterventions(filters: { date?: string; status?: string } = {}) {
	return useQuery({
		queryKey: queryKeys.interventions.list(filters),
		queryFn: async () => {
			const query: Record<string, string> = {}
			if (filters.date) query.date = filters.date
			if (filters.status) query.status = filters.status
			const res = await api.api.interventions.$get({ query })
			if (!res.ok) throw new Error("Failed to fetch interventions")
			return res.json().then((d) => d.data as InterventionListItem[])
		},
		refetchInterval: 2_000,
	})
}

export function useIntervention(id: string) {
	return useQuery({
		queryKey: queryKeys.interventions.detail(id),
		queryFn: async () => {
			const res = await api.api.interventions[":id"].$get({ param: { id } })
			if (!res.ok) throw new Error("Failed to fetch intervention")
			return res.json().then((d) => d.data as InterventionDetail)
		},
		refetchInterval: 5_000,
	})
}

export function useCreateIntervention() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: CreateInterventionInput) => {
			const res = await api.api.interventions.$post({ json: input })
			if (!res.ok) throw new Error("Failed to create intervention")
			return res.json().then((d) => d.data)
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.interventions.all }),
	})
}

export function useUpdateIntervention(id: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: UpdateInterventionInput) => {
			const res = await api.api.interventions[":id"].$patch({ param: { id }, json: input })
			if (!res.ok) throw new Error("Failed to update intervention")
			return res.json().then((d) => d.data)
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.interventions.all }),
	})
}

export function useDeleteIntervention() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.api.interventions[":id"].$delete({ param: { id } })
			if (!res.ok) throw new Error("Failed to delete intervention")
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.interventions.all }),
	})
}

export function useTransitionIntervention(id: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: TransitionInterventionInput) => {
			const res = await api.api.interventions[":id"].transition.$post({
				param: { id },
				json: input,
			})
			if (!res.ok) throw new Error("Failed to transition intervention")
			return res.json().then((d) => d.data)
		},
		onMutate: async (input) => {
			await qc.cancelQueries({ queryKey: queryKeys.interventions.detail(id) })
			const previous = qc.getQueryData<InterventionDetail>(queryKeys.interventions.detail(id))
			qc.setQueryData<InterventionDetail>(queryKeys.interventions.detail(id), (old) =>
				old ? { ...old, status: input.status } : old,
			)
			return { previous }
		},
		onError: (_err, _input, context) => {
			if (context?.previous) {
				qc.setQueryData(queryKeys.interventions.detail(id), context.previous)
			}
		},
		onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.interventions.detail(id) }),
	})
}

export function useAssignTechs(id: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: AssignTechInput) => {
			const res = await api.api.interventions[":id"].assign.$post({ param: { id }, json: input })
			if (!res.ok) throw new Error("Failed to assign techs")
			return res.json().then((d) => d.data)
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.interventions.detail(id) }),
	})
}

export function useAddNote(id: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (input: CreateNoteInput) => {
			const res = await api.api.interventions[":id"].notes.$post({ param: { id }, json: input })
			if (!res.ok) throw new Error("Failed to add note")
			return res.json().then((d) => d.data)
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.interventions.detail(id) }),
	})
}
