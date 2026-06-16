import { describe, it, expect, beforeEach } from "bun:test"
import { JobService } from "./job-service"
import { InMemoryJobRepository } from "../test-utils/in-memory-job-repository"
import { InMemoryAuditRepository } from "../test-utils/in-memory-audit-repository"
import { InMemoryAuthProvider } from "../test-utils/in-memory-auth-provider"

describe("Job full flow", () => {
  let service: JobService
  let userId: string

  beforeEach(async () => {
    const jobRepo = new InMemoryJobRepository()
    const auditRepo = new InMemoryAuditRepository()
    const authProvider = new InMemoryAuthProvider()

    const session = await authProvider.signUp({
      email: "tech@test.com",
      password: "pass",
      firstName: "Tech",
      lastName: "User",
      branchId: "b-1",
    })
    userId = session.user.id

    await jobRepo.save({
      id: "job-1",
      branchId: "b-1",
      jobTypeId: "jt-1",
      formTemplateId: "ft-1",
      customerId: "c-1",
      status: "SCHEDULED",
      version: 0,
      scheduledStartAt: new Date(),
    })

    service = new JobService(jobRepo, auditRepo, authProvider)
  })

  it("should complete full job cycle", async () => {
    const steps = ["EN_ROUTE", "IN_PROGRESS", "PENDING_APPROVAL", "COMPLETED"] as const

    for (const status of steps) {
      const job = await service.transitionJob("job-1", status, userId)
      expect(job.status).toBe(status)
    }
  })

  it("should cancel from SCHEDULED with reason", async () => {
    const job = await service.transitionJob("job-1", "CANCELLED", userId, "Client indisponible")
    expect(job.status).toBe("CANCELLED")
  })
})
