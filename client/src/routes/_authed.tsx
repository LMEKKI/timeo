import { useEffect } from "react"
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/lib/auth-client"

export const Route = createFileRoute("/_authed")({
	component: AuthedLayout,
})

function AuthedLayout() {
	const { user, isLoading, mustChangePassword } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (isLoading) return
		if (!user) {
			navigate({ to: "/login" })
		} else if (mustChangePassword) {
			navigate({ to: "/changer-mot-de-passe" })
		}
	}, [isLoading, user, mustChangePassword, navigate])

	if (isLoading) {
		return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
	}
	if (!user || mustChangePassword) return null
	return <Outlet />
}
