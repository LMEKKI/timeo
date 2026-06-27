import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { auth } from "./auth"
import { env } from "./lib/env"
import { handleError } from "./lib/errors"
import type { AppVariables } from "./lib/types"
import { authRoute } from "./routes/auth"
import { usersRoute } from "./routes/users"

const app = new Hono<{ Variables: AppVariables }>()

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

app.get("/api/health", (c) => c.json({ data: { status: "ok" } }))

app.route("/api/auth-custom", authRoute)
app.route("/api/users", usersRoute)

app.onError((err, c) => {
	const { status, body } = handleError(err)
	return c.json(body, status)
})

app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "Route introuvable" } }, 404))

export default app
export type AppType = typeof app
