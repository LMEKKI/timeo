import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, type FormEvent } from "react"
import { ArrowLeft, MapPin, Save, Play, Check } from "lucide-react"
import {
	useIntervention,
	useTransitionIntervention,
	useAddNote,
} from "@/hooks/use-interventions"
import { useClients } from "@/hooks/use-clients"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"

export const Route = createFileRoute("/_authed/tech/mission-detail/$id")({
	component: MissionDetailPage,
})

function MissionDetailPage() {
	const { id } = Route.useParams()
	const navigate = useNavigate()
	const { data: intervention, isLoading } = useIntervention(id)
	const { data: clients } = useClients()
	const transitionMutation = useTransitionIntervention(id)
	const addNoteMutation = useAddNote(id)
	const [newNote, setNewNote] = useState("")

	if (isLoading) return <div className="p-6">Chargement...</div>
	if (!intervention) return <div className="p-6">Mission introuvable.</div>

	const client = clients?.find((c) => c.id === intervention.clientId)

	const handleStart = () => transitionMutation.mutate({ status: "started" })
	const handleComplete = () => transitionMutation.mutate({ status: "completed" })
	const handleAddNote = async (e: FormEvent) => {
		e.preventDefault()
		if (!newNote.trim()) return
		await addNoteMutation.mutateAsync({ content: newNote })
		setNewNote("")
	}

	const canStart = intervention.status === "planned"
	const canComplete = intervention.status === "started"

	return (
		<div className="space-y-4 p-4 pb-24">
			<button
				type="button"
				onClick={() => navigate({ to: "/tech/missions" })}
				className="inline-flex items-center gap-1 text-sm text-muted-foreground"
			>
				<ArrowLeft size={14} />
				Retour
			</button>

			<div className="space-y-1">
				<h1 className="text-xl font-semibold">{intervention.title}</h1>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					{intervention.startTime}
				</div>
				<div className="flex gap-2">
					<StatusBadge status={intervention.status} />
					<PriorityBadge priority={intervention.priority ?? null} />
				</div>
			</div>

			{client && (
				<div className="rounded-lg border border-border bg-card p-4">
					<h2 className="font-medium">{client.name}</h2>
					{client.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
				</div>
			)}

			{intervention.description && (
				<div className="rounded-lg border border-border bg-card p-4">
					<h2 className="mb-2 text-sm font-medium text-muted-foreground">Description</h2>
					<p className="text-sm">{intervention.description}</p>
				</div>
			)}

			{intervention.chefNote && (
				<div className="rounded-lg border border-border bg-card p-4">
					<h2 className="mb-2 text-sm font-medium text-muted-foreground">Note du chef</h2>
					<p className="text-sm">{intervention.chefNote}</p>
				</div>
			)}

			<a
				href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(client?.name ?? "")}`}
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-4 text-sm font-medium hover:bg-accent"
			>
				<MapPin size={16} />
				Itinéraire
			</a>

			{intervention.notes && intervention.notes.length > 0 && (
				<div className="rounded-lg border border-border bg-card p-4">
					<h2 className="mb-2 text-sm font-medium">Notes ({intervention.notes.length})</h2>
					<div className="space-y-2">
						{intervention.notes.map((note) => (
							<div key={note.id} className="rounded bg-muted p-2 text-sm">
								<p className="text-xs text-muted-foreground">
									{note.authorName ?? "?"} ·{" "}
									{new Date(note.createdAt).toLocaleString("fr-FR")}
								</p>
								<p>{note.content}</p>
							</div>
						))}
					</div>
				</div>
			)}

			<form
				onSubmit={handleAddNote}
				className="rounded-lg border border-border bg-card p-4"
			>
				<h2 className="mb-2 text-sm font-medium">Ajouter une note</h2>
				<textarea
					value={newNote}
					onChange={(e) => setNewNote(e.target.value)}
					placeholder="..."
					rows={2}
					className="w-full rounded border border-input bg-background p-2 text-sm"
				/>
				<button
					type="submit"
					disabled={!newNote.trim()}
					className="mt-2 inline-flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				>
					<Save size={14} />
					Ajouter
				</button>
			</form>

			<div className="sticky bottom-16 flex gap-2 bg-background/90 p-2 backdrop-blur">
				{canStart && (
					<button
						type="button"
						onClick={handleStart}
						className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						<Play size={16} />
						Démarrer
					</button>
				)}
				{canComplete && (
					<button
						type="button"
						onClick={handleComplete}
						className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success py-3 text-sm font-medium text-success-foreground hover:bg-success/90"
					>
						<Check size={16} />
						Terminer
					</button>
				)}
			</div>
		</div>
	)
}
