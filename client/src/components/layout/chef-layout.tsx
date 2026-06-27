import { type ReactNode, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
	Home,
	ListChecks,
	Users,
	Wrench,
	User as UserIcon,
	LogOut,
	Menu,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NavItem = { to: string; label: string; icon: ReactNode }

const NAV_ITEMS: NavItem[] = [
	{ to: '/chef/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
	{ to: '/chef/interventions', label: 'Interventions', icon: <ListChecks size={18} /> },
	{ to: '/chef/clients', label: 'Clients', icon: <Users size={18} /> },
	{ to: '/chef/techs', label: 'Techs', icon: <Wrench size={18} /> },
	{ to: '/profil', label: 'Profil', icon: <UserIcon size={18} /> },
]

export function ChefLayout({ children }: { children: ReactNode }) {
	const [collapsed, setCollapsed] = useState(false)
	const { user, signOut } = useAuth()

	return (
		<div className="flex min-h-screen bg-background text-foreground">
			<aside
				className={cn(
					'flex flex-col border-r border-border bg-card transition-all duration-150',
					collapsed ? 'w-12' : 'w-56',
				)}
			>
				<div className="flex h-14 items-center justify-between border-b border-border px-3">
					{!collapsed && <span className="font-semibold">Timeo</span>}
					<Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
						<Menu size={18} />
					</Button>
				</div>
				<nav className="flex-1 space-y-1 p-2">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
							activeProps={{ className: 'bg-accent text-accent-foreground' }}
						>
							{item.icon}
							{!collapsed && <span>{item.label}</span>}
						</Link>
					))}
				</nav>
				<div className="border-t border-border p-2">
					<div
						className={cn(
							'flex items-center gap-2 px-3 py-2 text-sm',
							collapsed && 'justify-center',
						)}
					>
						<div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
							{user?.name?.[0]?.toUpperCase() ?? '?'}
						</div>
						{!collapsed && <span className="truncate">{user?.name}</span>}
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={signOut}
						className={cn('w-full', collapsed && 'px-0')}
					>
						<LogOut size={16} />
						{!collapsed && <span className="ml-2">Déconnexion</span>}
					</Button>
				</div>
			</aside>
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	)
}
