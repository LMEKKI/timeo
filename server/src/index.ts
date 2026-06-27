import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { auth } from "./auth"
import { env } from "./lib/env"
import { handleError } from "./lib/errors"
import { authRoute } from "./routes/auth"
import { usersRoute } from "./routes/users"
import { clientsRoute } from "./routes/clients"
import { interventionsRoute } from "./routes/interventions"
import { interventionAssignmentsRoute } from "./routes/intervention-assignments"
import { interventionNotesRoute } from "./routes/intervention-notes"
import { proximityRoute } from "./routes/proximity"
import { dashboardRoute } from "./routes/dashboard"

type Variables = {
	user: typeof auth.$Infer.Session.user | null
	session: typeof auth.$Infer.Session.session | null
}

const app = new Hono<{ Variables: Variables }>()

app.use(
	"*",
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
	}),
)

app.use("*", logger())

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers })
	c.set("user", session?.user ?? null)
	c.set("session", session?.session ?? null)
	return next()
})

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

app.route("/api/auth-custom", authRoute)
app.route("/api/users", usersRoute)
app.route("/api/clients", clientsRoute)
app.route("/api/interventions", interventionsRoute)
app.route("/api/interventions", interventionAssignmentsRoute)
app.route("/api/interventions", interventionNotesRoute)
app.route("/api/proximity", proximityRoute)
app.route("/api/dashboard", dashboardRoute)

app.get("/api/health", (c) =>
	c.json({ data: { status: "ok", message: "Timeo API is running" } }),
)

app.onError((err, c) => {
	const { status, body } = handleError(err)
	return c.json(body, status)
})

app.notFound((c) =>
	c.json({ error: { code: "NOT_FOUND", message: "Route introuvable" } }, 404),
)

export type AppType = typeof app

export { app }

if (typeof Bun !== "undefined") {
	Bun.serve({
		port: env.PORT,
		fetch: app.fetch,
	})
	console.log(`🚀 Timeo API ready on http://localhost:${env.PORT}`)
}
