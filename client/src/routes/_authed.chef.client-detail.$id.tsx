import { createFileRoute, Link } from "@tanstack/react-router"
import { useState, type FormEvent } from "react"
import { ArrowLeft, Plus, Phone, Mail, FileText } from "lucide-react"
import { useClient, useAddInterlocuteur, type Interlocuteur } from "@/hooks/use-clients"
import { useInterventions } from "@/hooks/use-interventions"
import { StatusBadge } from "@/components/shared/status-badge"

type Intervention = {
	id: string
	clientId: string
	title: string
	date: string
	startTime: string
	status: "unassigned" | "planned" | "started" | "completed" | "cancelled"
}

export const Route = createFileRoute("/_authed/chef/client-detail/$id")({
	component: ClientDetailPage,
})

function ClientDetailPage() {
	const { id } = Route.useParams()
	const { data: client, isLoading } = useClient(id)
	const { data: interventions } = useInterventions()
	const addInterlocuteur = useAddInterlocuteur(id)
	const [showAddForm, setShowAddForm] = useState(false)
	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
	const [phone, setPhone] = useState("")

	if (isLoading) return <div className="p-6">Chargement...</div>
	if (!client) return <div className="p-6">Client introuvable.</div>

	const clientInterventions = interventions?.filter((i: Intervention) => i.clientId === id) ?? []

	const handleAdd = async (e: FormEvent) => {
		e.preventDefault()
		if (!firstName.trim() || !lastName.trim()) return
		await addInterlocuteur.mutateAsync({ firstName, lastName, phone: phone || undefined, isPrimary: false })
		setFirstName("")
		setLastName("")
		setPhone("")
		setShowAddForm(false)
	}

	return (
		<div className="space-y-6 p-6">
			<Link to="/chef/clients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft size={14} />Retour
			</Link>

			<h1 className="text-2xl font-semibold">{client.name}</h1>

			<div className="grid gap-6 md:grid-cols-2">
				<section className="rounded-lg border border-border bg-card p-4">
					<h2 className="mb-3 font-medium">Informations</h2>
					<div className="space-y-2 text-sm">
						{client.phone && <p className="flex items-center gap-2"><Phone size={14} />{client.phone}</p>}
						{client.email && <p className="flex items-center gap-2"><Mail size={14} />{client.email}</p>}
						{client.notes && <p className="text-muted-foreground">{client.notes}</p>}
					</div>
				</section>

				<section className="rounded-lg border border-border bg-card p-4">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="font-medium">Interlocuteurs</h2>
						<button type="button" onClick={() => setShowAddForm(!showAddForm)} className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent">
							<Plus size={14} />
						</button>
					</div>
					{showAddForm && (
						<form onSubmit={handleAdd} className="mb-3 space-y-2 rounded border border-border p-2">
							<input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="w-full rounded border border-input bg-background px-2 py-1 text-sm" />
							<input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="w-full rounded border border-input bg-background px-2 py-1 text-sm" />
							<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone" className="w-full rounded border border-input bg-background px-2 py-1 text-sm" />
							<button type="submit" disabled={!firstName || !lastName} className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Ajouter</button>
						</form>
					)}
					{client.interlocuteurs && client.interlocuteurs.length > 0 ? (
						<ul className="space-y-1 text-sm">
							{client.interlocuteurs.map((i: Interlocuteur) => (
								<li key={i.id} className="flex items-center gap-2">
									<span>{i.firstName} {i.lastName}</span>
									{i.role && <span className="text-xs text-muted-foreground">({i.role})</span>}
									{i.phone && <span className="text-xs text-muted-foreground">· {i.phone}</span>}
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-muted-foreground">Aucun interlocuteur.</p>
					)}
				</section>
			</div>

			<section className="rounded-lg border border-border bg-card p-4">
				<h2 className="mb-3 flex items-center gap-2 font-medium">
					<FileText size={16} />Historique ({clientInterventions.length})
				</h2>
				{clientInterventions.length === 0 ? (
					<p className="text-sm text-muted-foreground">Aucune intervention.</p>
				) : (
					<div className="space-y-2">
						{clientInterventions.map((i: Intervention) => (
							<Link
								key={i.id}
								to="/chef/intervention-detail/$id"
								params={{ id: i.id }}
								className="flex items-center justify-between rounded border border-border p-2 text-sm hover:bg-accent"
							>
								<div>
									<span className="font-medium">{i.title}</span>
									<span className="ml-2 text-xs text-muted-foreground">{i.date} · {i.startTime}</span>
								</div>
								<StatusBadge status={i.status} />
							</Link>
						))}
					</div>
				)}
			</section>
		</div>
	)
}
