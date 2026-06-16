import type { IJobRepository, PaginationOpts } from "shared"
import type { Job, JobStatus } from "shared"

export class InMemoryJobRepository implements IJobRepository {
  private jobs = new Map<string, Job>()

  async findById(id: string): Promise<Job | null> {
    return this.jobs.get(id) ?? null
  }

  async findByBranch(branchId: string, opts?: PaginationOpts): Promise<Job[]> {
    const all = Array.from(this.jobs.values()).filter(j => j.branchId === branchId)
    if (opts) return all.slice(opts.offset, opts.offset + opts.limit)
    return all
  }

  async findByStatus(status: JobStatus, opts?: PaginationOpts): Promise<Job[]> {
    const all = Array.from(this.jobs.values()).filter(j => j.status === status)
    if (opts) return all.slice(opts.offset, opts.offset + opts.limit)
    return all
  }

  async save(job: Omit<Job, "createdAt">): Promise<Job> {
    const now = new Date()
    const saved: Job = { ...job, createdAt: now }
    this.jobs.set(job.id, saved)
    return saved
  }

  async updateStatus(id: string, newStatus: JobStatus, expectedVersion: number): Promise<boolean> {
    const job = this.jobs.get(id)
    if (!job) return false
    if (job.version !== expectedVersion) return false
    this.jobs.set(id, { ...job, status: newStatus, version: job.version + 1 })
    return true
  }

  async assignTechnician(jobId: string, userId: string, isPrimary: boolean): Promise<void> {
    // no-op for in-memory
  }

  async removeTechnician(jobId: string, userId: string): Promise<void> {
    // no-op for in-memory
  }

  async delete(id: string): Promise<void> {
    this.jobs.delete(id)
  }
}
