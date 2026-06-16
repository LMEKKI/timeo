import { describe, it, expect, beforeEach } from "bun:test"
import { JobService } from "./job-service"
import { InMemoryJobRepository } from "../test-utils/in-memory-job-repository"
import { InMemoryAuditRepository } from "../test-utils/in-memory-audit-repository"
import { InMemoryAuthProvider } from "../test-utils/in-memory-auth-provider"
import type { Job } from "shared"
import { JobNotFoundError, InvalidTransitionError, OptimisticLockError, MissingReasonError } from "shared"

function createJob(overrides?: Partial<Omit<Job, "createdAt">>): Omit<Job, "createdAt"> {
  return {
    id: "job-1",
    branchId: "branch-1",
    jobTypeId: "jt-1",
    formTemplateId: "ft-1",
    customerId: "cust-1",
    status: "SCHEDULED",
    version: 0,
    scheduledStartAt: new Date(),
    ...overrides,
  }
}

describe("JobService", () => {
  let jobRepo: InMemoryJobRepository
  let auditRepo: InMemoryAuditRepository
  let authProvider: InMemoryAuthProvider
  let service: JobService
  let userId: string

  beforeEach(async () => {
    jobRepo = new InMemoryJobRepository()
    auditRepo = new InMemoryAuditRepository()
    authProvider = new InMemoryAuthProvider()
    service = new JobService(jobRepo, auditRepo, authProvider)

    const session = await authProvider.signUp({
      email: "tech@test.com",
      password: "pass",
      firstName: "Tech",
      lastName: "User",
      branchId: "b-1",
    })
    userId = session.user.id

    await jobRepo.save(createJob())
  })

  it("should get job by id", async () => {
    const job = await service.getJobById("job-1")
    expect(job.id).toBe("job-1")
  })

  it("should throw on non-existent job", async () => {
    expect(service.getJobById("nonexistent")).rejects.toThrow(JobNotFoundError)
  })

  it("should transition from SCHEDULED to EN_ROUTE", async () => {
    const updated = await service.transitionJob("job-1", "EN_ROUTE", userId)
    expect(updated.status).toBe("EN_ROUTE")
  })

  it("should reject invalid transitions", async () => {
    expect(service.transitionJob("job-1", "COMPLETED", userId)).rejects.toThrow(InvalidTransitionError)
  })

  it("should require reason for CANCELLED", async () => {
    expect(service.transitionJob("job-1", "CANCELLED", userId)).rejects.toThrow(MissingReasonError)
  })

  it("should cancel with reason", async () => {
    const updated = await service.transitionJob("job-1", "CANCELLED", userId, "Client absent")
    expect(updated.status).toBe("CANCELLED")
  })

  it("should detect optimistic lock version conflict", async () => {
    // The in-memory repo rejects updateStatus when version doesn't match
    const success = await jobRepo.updateStatus("job-1", "EN_ROUTE", 0)
    expect(success).toBe(true)

    // Another update with the same stale version should fail
    const failed = await jobRepo.updateStatus("job-1", "IN_PROGRESS", 0)
    expect(failed).toBe(false)
  })

  it("should create audit log on transition", async () => {
    await service.transitionJob("job-1", "EN_ROUTE", userId)
    const logs = await auditRepo.findByJob("job-1")
    expect(logs).toHaveLength(1)
    expect(logs[0]?.previousStatus).toBe("SCHEDULED")
    expect(logs[0]?.newStatus).toBe("EN_ROUTE")
  })
})
