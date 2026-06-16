import { Hono } from "hono"
import { cors } from "hono/cors"
import { errorHandler } from "./middleware/error"
import { createAuthRoutes } from "./routes/auth"
import { authMiddleware } from "./middleware/auth"
import { BetterAuthAdapter } from "./adapters/auth/better-auth"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const pgClient = postgres(process.env.DATABASE_URL!)
const db = drizzle(pgClient)

const authProvider = new BetterAuthAdapter(db)

export const app = new Hono()

app.use(cors())
app.onError(errorHandler)

// Public routes
const authRoutes = createAuthRoutes(authProvider)
app.route("/auth", authRoutes)

// Protected routes
app.use("/api/*", authMiddleware(authProvider))

app.get("/api/health", (c) => {
  return c.json({ success: true, message: "Timeo API is running" })
})

export default app
