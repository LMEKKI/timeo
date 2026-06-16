import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter, createRoute, createRootRoute } from "@tanstack/react-router"
import { LoginPage } from "./pages/login"
import { JobsPage } from "./pages/jobs"
import { JobDetailPage } from "./pages/job-detail"

const queryClient = new QueryClient()

const rootRoute = createRootRoute({})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
})

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs",
  component: JobsPage,
})

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs/$id",
  component: JobDetailPage,
})

const routeTree = rootRoute.addChildren([loginRoute, jobsRoute, jobDetailRoute])
const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
