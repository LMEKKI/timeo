import { Hono } from "hono"
import { cors } from "hono/cors"
import { errorHandler } from "./middleware/error"
import { createAuthRoutes } from "./routes/auth"
import { authMiddleware } from "./middleware/auth"
import { createJobRoutes } from "./routes/job"
import { BetterAuthAdapter } from "./adapters/auth/better-auth"
import { DrizzleJobRepository } from "./adapters/drizzle/job-repository"
import { DrizzleAuditRepository } from "./adapters/drizzle/audit-repository"
import { JobService } from "./services/job-service"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./db/schema"

const pgClient = postgres(process.env.DATABASE_URL!)
const db = drizzle(pgClient, { schema })

const authProvider = new BetterAuthAdapter(db)
const jobRepo = new DrizzleJobRepository(db)
const auditRepo = new DrizzleAuditRepository(db)
const jobService = new JobService(jobRepo, auditRepo, authProvider)

export const app = new Hono()

app.use(cors())
app.onError(errorHandler)

// Public routes
const authRoutes = createAuthRoutes(authProvider)
app.route("/auth", authRoutes)

// Protected routes
app.use("/api/*", authMiddleware(authProvider))

const jobRoutes = createJobRoutes(jobService)
app.route("/api/jobs", jobRoutes)

app.get("/api/health", (c) => {
  return c.json({ success: true, message: "Timeo API is running" })
})

export default app
