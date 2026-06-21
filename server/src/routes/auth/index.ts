/**
 * Auth routes — Better Auth handles everything.
 *
 * Better Auth exposes its own endpoints at:
 *   GET/POST  /api/auth/**  (sign-in, sign-out, session, etc.)
 *
 * This file is a placeholder for any custom auth-related endpoints
 * that may be needed (e.g., profile retrieval, password change).
 */

import { eq } from "drizzle-orm"
import { db } from "../../db"
import { user, userProfile } from "../../db/schema"
import { factory } from "../../lib/hono"
import { requireAuth } from "../../middleware/auth"

const app = factory.createApp()

/**
 * GET /api/auth/me — Get current user profile.
 *
 * Returns the authenticated user's info along with their Timeo profile.
 * This is an alternative to calling Better Auth's session endpoint directly.
 */
app.get("/me", requireAuth, async (c) => {
  const userId = c.var.userId
  const role = c.var.userRole
  const userName = c.var.userName

  return c.json({
    success: true,
    data: {
      id: userId,
      name: userName,
      role,
    },
  }, 200)
})

export default app
