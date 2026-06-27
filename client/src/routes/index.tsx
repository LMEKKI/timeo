import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
	component: IndexRoute,
})

function IndexRoute() {
	const { user, isLoading } = useAuth()
	if (isLoading) {
		return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
	}
	if (!user) throw redirect({ to: '/login' })
	if (user.mustChangePassword) throw redirect({ to: '/changer-mot-de-passe' })
	throw redirect({ to: user.role === 'chef' ? '/chef/dashboard' : '/non-autorise' })
}
