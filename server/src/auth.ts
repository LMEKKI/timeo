import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { username } from "better-auth/plugins"
import { db } from "./db"
import * as schema from "./db/schema"

/**
 * Better Auth server instance.
 *
 * Uses Drizzle adapter with PostgreSQL. The `username` plugin enables
 * login via username instead of email. Session is managed via HttpOnly cookies.
 *
 * @see https://www.better-auth.com/docs/installation
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
})
