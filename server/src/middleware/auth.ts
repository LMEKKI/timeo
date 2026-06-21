import { createMiddleware } from "hono/factory"
import { db } from "../db"
import { userProfile } from "../db/schema"
import { eq } from "drizzle-orm"
import { unauthorized, forbidden } from "../lib/errors"
import { auth } from "../auth"

/**
 * Variables injected into request context by auth middleware.
 */
export interface AuthVariables {
  userId: string
  userName: string
  userRole: "chef" | "tech"
  disponibilite: "disponible" | "indisponible" | "en_intervention"
}

/**
 * Middleware: Verifies the Better Auth session from the request cookies/headers.
 *
 * Must run on all protected routes. Sets `userId`, `userName`, `userRole`,
 * and `disponibilite` on the Hono context.
 */
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session?.user) {
    return unauthorized(c)
  }

  const [profile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, session.user.id))
    .limit(1)

  if (!profile) {
    return unauthorized(c, "Profil utilisateur introuvable")
  }

  c.set("userId", session.user.id)
  c.set("userName", session.user.name)
  c.set("userRole", profile.role)
  c.set("disponibilite", profile.disponibilite)

  await next()
})

/**
 * Middleware factory: Requires a specific role to access the route.
 * Must be used AFTER `requireAuth`.
 */
export function requireRole(...roles: Array<"chef" | "tech">) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const role = c.var.userRole
    if (!roles.includes(role)) {
      return forbidden(c, "Vous n'avez pas les droits pour cette action")
    }
    await next()
  })
}
