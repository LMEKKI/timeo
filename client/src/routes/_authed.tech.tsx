import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/tech")({
	component: TechLayout,
})

function TechLayout() {
	return <Outlet />
}
