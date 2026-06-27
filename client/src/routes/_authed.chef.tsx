import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-client'
import { ChefLayout } from '@/components/layout/chef-layout'

export const Route = createFileRoute('/_authed/chef')({
	component: ChefLayoutRoute,
})

function ChefLayoutRoute() {
	const { user, isLoading } = useAuth()
	if (isLoading) {
		return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
	}
	if (!user) throw redirect({ to: '/login' })
	if (user.role !== 'chef') throw redirect({ to: '/non-autorise' })
	return (
		<ChefLayout>
			<Outlet />
		</ChefLayout>
	)
}
