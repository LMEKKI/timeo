import { createMiddleware } from "hono/factory"
import type { IAuthProvider, UserProfile } from "shared"
import { UnauthorizedError } from "shared"

declare module "hono" {
  interface ContextVariableMap {
    user: UserProfile
  }
}

export function authMiddleware(authProvider: IAuthProvider) {
  return createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer ")) throw new UnauthorizedError()

    const token = authHeader.slice(7)
    const session = await authProvider.verifySession(token)
    if (!session) throw new UnauthorizedError()

    c.set("user", session.user)
    await next()
  })
}
