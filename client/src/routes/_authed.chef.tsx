import { useEffect } from "react"
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/lib/auth-client"
import { ChefLayout } from "@/components/layout/chef-layout"

export const Route = createFileRoute("/_authed/chef")({
	component: ChefLayoutRoute,
})

function ChefLayoutRoute() {
	const { user, isLoading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (isLoading) return
		if (!user) {
			navigate({ to: "/login" })
		} else if (user.role !== "chef") {
			navigate({ to: "/tech/missions" })
		}
	}, [isLoading, user, navigate])

	if (isLoading) {
		return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
	}
	if (!user || user.role !== "chef") return null
	return (
		<ChefLayout>
			<Outlet />
		</ChefLayout>
	)
}
