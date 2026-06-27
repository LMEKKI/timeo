import { createFileRoute } from "@tanstack/react-router"
import { useUsers } from "@/hooks/use-users"
import { AVAILABILITY_LABEL_FR } from "@/lib/constants"
import { cn } from "@/lib/utils"

type User = { id: string; name: string; username: string; role: string; availabilityStatus?: keyof typeof AVAILABILITY_LABEL_FR }

const AVAILABILITY_DOT: Record<keyof typeof AVAILABILITY_LABEL_FR, string> = {
	available: "bg-success",
	on_mission: "bg-warning",
	absent: "bg-destructive",
}

export const Route = createFileRoute("/_authed/chef/techs")({
	component: TechsPage,
})

function TechsPage() {
	const { data, isLoading } = useUsers()
	const techs = data?.filter((u: User) => u.role === "tech") ?? []

	return (
		<div className="space-y-4 p-6">
			<h1 className="text-2xl font-semibold">Techniciens</h1>

			{isLoading ? (
				<div className="space-y-2">
					{["t1", "t2", "t3"].map((k) => (
						<div key={k} className="h-16 animate-pulse rounded-lg bg-muted" />
					))}
				</div>
			) : techs.length === 0 ? (
				<p className="text-sm text-muted-foreground">Aucun technicien.</p>
			) : (
				<div className="space-y-2">
					{techs.map((tech: User) => {
						const status = (tech.availabilityStatus ?? "available") as keyof typeof AVAILABILITY_LABEL_FR
						return (
							<div key={tech.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
										{tech.name?.[0]?.toUpperCase() ?? "?"}
									</div>
									<div>
										<p className="font-medium">{tech.name}</p>
										<p className="text-xs text-muted-foreground">@{tech.username}</p>
									</div>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<span className={cn("h-2 w-2 rounded-full", AVAILABILITY_DOT[status])} />
									<span>{AVAILABILITY_LABEL_FR[status]}</span>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
