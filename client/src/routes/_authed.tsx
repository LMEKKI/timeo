import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-client'

export const Route = createFileRoute('/_authed')({
	component: AuthedLayout,
})

function AuthedLayout() {
	const { user, isLoading, mustChangePassword } = useAuth()
	if (isLoading) {
		return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
	}
	if (!user) throw redirect({ to: '/login' })
	if (mustChangePassword) throw redirect({ to: '/changer-mot-de-passe' })
	return <Outlet />
}
