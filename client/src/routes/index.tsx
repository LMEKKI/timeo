import { useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/lib/auth-client"

export const Route = createFileRoute("/")({
	component: IndexRoute,
})

function IndexRoute() {
	const { user, isLoading, mustChangePassword } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (isLoading) return
		if (!user) {
			navigate({ to: "/login" })
		} else if (mustChangePassword) {
			navigate({ to: "/changer-mot-de-passe" })
		} else {
			navigate({ to: user.role === "chef" ? "/chef/dashboard" : "/tech/missions" })
		}
	}, [isLoading, user, mustChangePassword, navigate])

	if (isLoading) {
		return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
	}
	return null
}
