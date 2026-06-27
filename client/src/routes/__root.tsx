import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import type { AuthContext } from "@/lib/auth-client"

export type RouterContext = {
	queryClient: QueryClient
	auth: AuthContext
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
})

function RootComponent() {
	return <Outlet />
}
