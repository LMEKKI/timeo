import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "../auth"

import interventionsRoutes from "./interventions"
import techniciensRoutes from "./techniciens"
import clientsRoutes from "./clients"
import dashboardRoutes from "./dashboard"
import geocodingRoutes from "./geocoding"
import authRoutes from "./auth"

/**
 * API app factory.
 *
 * Composes all route modules under `/api` prefix and exposes the
 * full type for Hono RPC client generation.
 *
 * Usage:
 *   ```
 *   import app from './routes'
 *   export type AppType = typeof app
 *   ```
 *
 *   // Client (frontend):
 *   ```
 *   import { hc } from 'hono/client'
 *   import type { AppType } from 'server'
 *   const client = hc<AppType>('/api')
 *   ```
 */

const app = new Hono()

// ─── Global middleware ────────────────────────────────────────────────────────
app.use("*", cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (c) => {
  return c.json({ success: true, message: "Timeo API is running" }, 200)
})

// ─── Auth routes — Better Auth handles /api/auth/** ───────────────────────────
// Better Auth session middleware runs before custom auth routes
app.use("/api/auth/*", auth.handler)
app.route("/api/auth", authRoutes)

// ─── Feature routes ───────────────────────────────────────────────────────────

/** Interventions — CRUD, status transitions, notes, history */
app.route("/api/interventions", interventionsRoutes)

/** Techniciens — listing, profiles, availability */
app.route("/api/techniciens", techniciensRoutes)

/** Clients — CRUD with address and interlocuteurs */
app.route("/api/clients", clientsRoutes)

/** Dashboard — stats, tech workload, calendar */
app.route("/api/dashboard", dashboardRoutes)

/** Geocoding — Google Maps Geocoding API proxy */
app.route("/api/geocoding", geocodingRoutes)

// ─── Global error handler ─────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error("Unhandled error:", err)
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Erreur serveur. Réessayez.",
      },
    },
    500,
  )
})

export type AppType = typeof app

export default app
