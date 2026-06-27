import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState, type FormEvent } from "react"
import { ArrowLeft, Save, Trash2, UserPlus } from "lucide-react"
import {
	useIntervention, useUpdateIntervention, useDeleteIntervention,
	useTransitionIntervention, useAddNote, useAssignTechs,
} from "@/hooks/use-interventions"
import { useUsers } from "@/hooks/use-users"
import { useClients } from "@/hooks/use-clients"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"

type Client = { id: string; name: string }
type Tech = { id: string; name: string; username: string; role: string }
type Note = { id: string; content: string; authorName?: string | null }

export const Route = createFileRoute("/_authed/chef/intervention-detail/$id")({
	component: InterventionDetailPage,
})

function InterventionDetailPage() {
	const { id } = Route.useParams()
	const navigate = useNavigate()
	const { data: intervention, isLoading } = useIntervention(id)
	const { data: users } = useUsers()
	const { data: clients } = useClients()
	const updateMutation = useUpdateIntervention(id)
	const deleteMutation = useDeleteIntervention()
	const transitionMutation = useTransitionIntervention(id)
	const assignMutation = useAssignTechs(id)
	const addNoteMutation = useAddNote(id)

	const [chefNote, setChefNote] = useState("")
	const [techNote, setTechNote] = useState("")
	const [selectedTechs, setSelectedTechs] = useState<string[]>([])

	if (isLoading) return <div className="p-6">Chargement...</div>
	if (!intervention) return <div className="p-6">Intervention introuvable.</div>

	const client = clients?.find((c: Client) => c.id === intervention.clientId)
	const techs = users?.filter((u: Tech) => u.role === "tech") ?? []

	const handleSaveNote = async (e: FormEvent) => {
		e.preventDefault()
		if (!chefNote.trim()) return
		await updateMutation.mutateAsync({ chefNote })
		setChefNote("")
	}

	const handleAddNote = async (e: FormEvent) => {
		e.preventDefault()
		if (!techNote.trim()) return
		await addNoteMutation.mutateAsync({ content: techNote })
		setTechNote("")
	}

	const handleAssign = async () => {
		if (selectedTechs.length === 0) return
		await assignMutation.mutateAsync({ userIds: selectedTechs })
		setSelectedTechs([])
	}

	const handleDelete = async () => {
		if (!confirm("Supprimer cette intervention ?")) return
		await deleteMutation.mutateAsync(id)
		await navigate({ to: "/chef/interventions" })
	}

	const toggleTech = (techId: string) => {
		setSelectedTechs((prev) => prev.includes(techId) ? prev.filter((t) => t !== techId) : [...prev, techId])
	}

	return (
		<div className="space-y-6 p-6">
			<Link to="/chef/interventions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft size={14} />Retour
			</Link>

			<div className="flex items-start justify-between">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold">{intervention.title}</h1>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						{client?.name} · {intervention.date} · {intervention.startTime}
					</div>
				</div>
				<div className="flex gap-2">
					<StatusBadge status={intervention.status} />
					<PriorityBadge priority={intervention.priority ?? null} />
				</div>
			</div>

			{intervention.description && (
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">Description</p>
					<p className="mt-1">{intervention.description}</p>
				</div>
			)}

			<section className="rounded-lg border border-border bg-card p-4">
				<h2 className="mb-3 font-medium">Assigner des techniciens</h2>
				<div className="space-y-2">
					{techs.length === 0 ? (
						<p className="text-sm text-muted-foreground">Aucun technicien. Créez-en dans la page Techs.</p>
					) : techs.map((tech: Tech) => (
						<label key={tech.id} className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={selectedTechs.includes(tech.id)}
								onChange={() => toggleTech(tech.id)}
								className="h-4 w-4 rounded"
							/>
							<span>{tech.name}</span>
							<span className="text-xs text-muted-foreground">@{tech.username}</span>
						</label>
					))}
				</div>
				<button
					type="button"
					onClick={handleAssign}
					disabled={selectedTechs.length === 0}
					className="mt-3 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				>
					<UserPlus size={16} />Assigner
				</button>
			</section>

			<section className="rounded-lg border border-border bg-card p-4">
				<h2 className="mb-3 font-medium">Note chef</h2>
				<form onSubmit={handleSaveNote}>
					<textarea value={chefNote} onChange={(e) => setChefNote(e.target.value)} placeholder="Ajoutez une note..." className="w-full rounded border border-input bg-background p-2 text-sm" rows={3} />
					<button type="submit" disabled={!chefNote.trim()} className="mt-2 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
						<Save size={16} />Enregistrer
					</button>
				</form>
			</section>

			<section className="rounded-lg border border-border bg-card p-4">
				<h2 className="mb-3 font-medium">Notes ({intervention.notes?.length ?? 0})</h2>
				{intervention.notes && intervention.notes.length > 0 && (
					<div className="mb-3 space-y-2">
						{intervention.notes.map((note: Note) => (
							<div key={note.id} className="rounded bg-muted p-2 text-sm">
								<p className="font-medium">{note.authorName ?? "?"}</p>
								<p className="text-muted-foreground">{note.content}</p>
							</div>
						))}
					</div>
				)}
				<form onSubmit={handleAddNote}>
					<textarea value={techNote} onChange={(e) => setTechNote(e.target.value)} placeholder="Ajouter une note..." className="w-full rounded border border-input bg-background p-2 text-sm" rows={2} />
					<button type="submit" disabled={!techNote.trim()} className="mt-2 inline-flex items-center gap-2 rounded bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50">
						Ajouter
					</button>
				</form>
			</section>

			<div className="flex flex-wrap gap-2 border-t border-border pt-4">
				{intervention.status === "planned" && (
					<button type="button" onClick={() => transitionMutation.mutate({ status: "started" })} className="rounded bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">Démarrer</button>
				)}
				{intervention.status === "started" && (
					<button type="button" onClick={() => transitionMutation.mutate({ status: "completed" })} className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Terminer</button>
				)}
				{intervention.status !== "completed" && intervention.status !== "cancelled" && (
					<button type="button" onClick={() => transitionMutation.mutate({ status: "cancelled" })} className="rounded bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">Annuler</button>
				)}
				<button type="button" onClick={handleDelete} className="ml-auto inline-flex items-center gap-2 rounded px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
					<Trash2 size={16} />Supprimer
				</button>
			</div>
		</div>
	)
}
