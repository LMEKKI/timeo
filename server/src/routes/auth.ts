import { Hono } from "hono"
import type { IAuthProvider } from "shared"
import { InvalidCredentialsError } from "shared"

export function createAuthRoutes(authProvider: IAuthProvider) {
  const router = new Hono()

  router.post("/sign-in", async (c) => {
    const body = await c.req.json()
    const { email, password } = body

    if (!email || !password) {
      return c.json({ success: false, error: "Email and password are required" }, 400)
    }

    try {
      const session = await authProvider.signIn({ email, password })
      return c.json({ success: true, data: session })
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return c.json({ success: false, error: "Invalid credentials" }, 401)
      }
      throw err
    }
  })

  router.post("/sign-out", async (c) => {
    const authHeader = c.req.header("Authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : ""
    await authProvider.signOut(token)
    return c.json({ success: true })
  })

  router.get("/me", async (c) => {
    const user = c.get("user")
    return c.json({ success: true, data: user })
  })

  return router
}
