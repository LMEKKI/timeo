import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-client"
import { queryClient } from "@/lib/query-client"
import { routeTree } from "./routeTree.gen"
import "./index.css"

const router = createRouter({
	routeTree,
	context: {
		queryClient,
		auth: {
			user: null,
			isLoading: true,
			mustChangePassword: false,
			signOut: async () => {},
		},
	},
	defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

const rootElement = document.getElementById("root")
if (!rootElement) {
	throw new Error("Root element not found")
}

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<ThemeProvider>
					<RouterProvider router={router} />
				</ThemeProvider>
			</AuthProvider>
		</QueryClientProvider>
	</StrictMode>,
)
