import { createMiddleware } from "hono/factory"
import type { z } from "zod"
import { validationError } from "../lib/errors"

type Target = "json" | "query" | "param"

/**
 * Middleware factory: Validates the request against a Zod schema.
 *
 * Usage:
 *   app.post('/items', zValidate('json', mySchema), handler)
 *   app.get('/items', zValidate('query', filterSchema), handler)
 *
 * On validation failure, returns a structured 400 error with field details.
 */
export function zValidate<T extends z.ZodType>(target: Target, schema: T) {
  return createMiddleware<{
    Variables: { validated: z.infer<T> }
  }>(async (c, next) => {
    let raw: unknown

    if (target === "json") {
      raw = await c.req.json().catch(() => null)
    } else if (target === "query") {
      raw = c.req.query()
    } else if (target === "param") {
      raw = c.req.param()
    }

    const result = schema.safeParse(raw)

    if (!result.success) {
      const firstIssue = result.error.issues[0]
      return validationError(
        c,
        firstIssue.message,
        firstIssue.path.join("."),
      )
    }

    c.set("validated", result.data)
    await next()
  })
}
