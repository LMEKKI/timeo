import { Hono } from "hono"
import type { JobService } from "../services/job-service"
import { JobNotFoundError, InvalidTransitionError, OptimisticLockError, MissingReasonError } from "shared"

export function createJobRoutes(jobService: JobService) {
  const router = new Hono()

  router.get("/", async (c) => {
    const user = c.get("user")
    const jobs = await jobService.getJobsByUser(user.id)
    return c.json({ success: true, data: jobs })
  })

  router.get("/:id", async (c) => {
    const id = c.req.param("id")
    try {
      const job = await jobService.getJobById(id)
      return c.json({ success: true, data: job })
    } catch (err) {
      if (err instanceof JobNotFoundError) {
        return c.json({ success: false, error: err.message }, 404)
      }
      throw err
    }
  })

  router.post("/:id/transition", async (c) => {
    const id = c.req.param("id")
    const user = c.get("user")
    const body = await c.req.json()
    const { status, reason } = body

    if (!status) {
      return c.json({ success: false, error: "Status is required" }, 400)
    }

    try {
      const job = await jobService.transitionJob(id, status, user.id, reason)
      return c.json({ success: true, data: job })
    } catch (err) {
      if (err instanceof JobNotFoundError) return c.json({ success: false, error: err.message }, 404)
      if (err instanceof InvalidTransitionError) return c.json({ success: false, error: err.message }, 409)
      if (err instanceof OptimisticLockError) return c.json({ success: false, error: err.message }, 409)
      if (err instanceof MissingReasonError) return c.json({ success: false, error: err.message }, 400)
      throw err
    }
  })

  return router
}
