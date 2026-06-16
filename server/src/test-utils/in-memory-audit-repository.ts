import type { IAuditRepository } from "shared"
import type { JobAuditLog } from "shared"

export class InMemoryAuditRepository implements IAuditRepository {
  private logs: JobAuditLog[] = []

  async log(entry: Omit<JobAuditLog, "id" | "createdAt">): Promise<JobAuditLog> {
    const saved: JobAuditLog = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    this.logs.push(saved)
    return saved
  }

  async findByJob(jobId: string): Promise<JobAuditLog[]> {
    return this.logs.filter(l => l.jobId === jobId)
  }

  async findRecentByUser(userId: string, limit: number): Promise<JobAuditLog[]> {
    return this.logs
      .filter(l => l.userProfileId === userId)
      .slice(-limit)
      .reverse()
  }
}
