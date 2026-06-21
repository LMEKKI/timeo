import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()

app.use("*", cors({ origin: process.env.CORS_ORIGIN || "*" }))

app.onError((err, c) => {
  console.error(err)
  return c.json({
    error: { code: "INTERNAL_ERROR", message: "Erreur serveur" },
  }, 500)
})

app.get("/api/health", (c) => {
  return c.json({ data: { status: "ok", message: "Timeo API is running" } })
})

export type AppType = typeof app

export default app
