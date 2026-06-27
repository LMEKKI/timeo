import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import { useAuth } from "@/lib/auth-client"
import { TechLayout } from "@/components/layout/tech-layout"

export const Route = createFileRoute("/_authed/tech")({
	component: TechLayoutRoute,
})

function TechLayoutRoute() {
	const { user, isLoading } = useAuth()
	if (isLoading) return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
	if (!user) throw redirect({ to: "/login" })
	if (user.role !== "tech") throw redirect({ to: "/non-autorise" })
	return (
		<TechLayout>
			<Outlet />
		</TechLayout>
	)
}
