/**
 * Hono factory with shared Env type.
 *
 * Using `createFactory` ensures type-safe middleware and handlers
 * across all route modules without repeating generic parameters.
 */

import { createFactory } from "hono/factory"
import type { AuthVariables } from "../middleware/auth"

export interface AppEnv {
  Variables: AuthVariables & {
    validated: unknown
  }
}

export const factory = createFactory<AppEnv>()
