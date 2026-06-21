import { serve } from "bun"
import app from "./routes"

/**
 * Timeo API — Hono server entry point.
 *
 * All routes are composed in `routes/index.ts` including Better Auth.
 * This file only starts the server and exports the AppType for RPC clients.
 *
 * Start: `bun run dev:server`
 */

const port = Number(process.env.PORT) || 3000

console.log(`🚀 Timeo API running on http://localhost:${port}`)
console.log(`📋 Health check: http://localhost:${port}/api/health`)

serve({
  fetch: app.fetch,
  port,
})

export type AppType = typeof app

export default app
