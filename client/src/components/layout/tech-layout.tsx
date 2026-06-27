import type { ReactNode } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { ClipboardList, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = { to: string; label: string; icon: ReactNode }

const NAV_ITEMS: NavItem[] = [
	{ to: "/tech/missions", label: "Missions", icon: <ClipboardList size={20} /> },
	{ to: "/profil", label: "Profil", icon: <UserIcon size={20} /> },
]

export function TechLayout({ children }: { children: ReactNode }) {
	const location = useLocation()

	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<main className="flex-1 overflow-auto">{children}</main>
			<nav className="sticky bottom-0 border-t border-border bg-card">
				<div className="flex">
					{NAV_ITEMS.map((item) => {
						const isActive = location.pathname.startsWith(item.to)
						return (
							<Link
								key={item.to}
								to={item.to}
								className={cn(
									"flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{item.icon}
								<span>{item.label}</span>
							</Link>
						)
					})}
				</div>
			</nav>
		</div>
	)
}
