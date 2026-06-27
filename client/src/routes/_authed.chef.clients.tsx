import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { Search, Phone, Mail } from "lucide-react"
import { useClients, type Client } from "@/hooks/use-clients"

export const Route = createFileRoute("/_authed/chef/clients")({
	component: ClientsListPage,
})

function ClientsListPage() {
	const [search, setSearch] = useState("")
	const { data, isLoading } = useClients(search)

	return (
		<div className="space-y-4 p-6">
			<h1 className="text-2xl font-semibold">Clients</h1>

			<div className="relative">
				<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Rechercher par nom ou téléphone..."
					className="w-full rounded border border-input bg-background pl-9 pr-3 py-2 text-sm"
				/>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{["c1", "c2", "c3"].map((k) => (
						<div key={k} className="h-16 animate-pulse rounded-lg bg-muted" />
					))}
				</div>
			) : !data || data.length === 0 ? (
				<p className="text-sm text-muted-foreground">Aucun client.</p>
			) : (
				<div className="space-y-2">
					{data.map((client: Client) => (
						<Link
							key={client.id}
							to="/chef/client-detail/$id"
							params={{ id: client.id }}
							className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
						>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-medium">{client.name}</h3>
									<div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
										{client.phone && <span className="flex items-center gap-1"><Phone size={10} />{client.phone}</span>}
										{client.email && <span className="flex items-center gap-1"><Mail size={10} />{client.email}</span>}
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
