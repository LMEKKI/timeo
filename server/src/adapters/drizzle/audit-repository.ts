import { eq, desc } from "drizzle-orm"
import type { IAuditRepository } from "shared"
import type { JobAuditLog, JobStatus } from "shared"
import type { DrizzleDB } from "../../db"
import { jobAuditLog } from "../../db/schema/audit"

function mapRowToAuditLog(row: typeof jobAuditLog.$inferSelect): JobAuditLog {
  return {
    id: row.id,
    jobId: row.jobId,
    userProfileId: row.userProfileId,
    previousStatus: row.previousStatus as JobStatus,
    newStatus: row.newStatus as JobStatus,
    commentReason: row.commentReason ?? undefined,
    createdAt: row.createdAt,
  }
}

export class DrizzleAuditRepository implements IAuditRepository {
  constructor(private db: DrizzleDB) {}

  async log(entry: Omit<JobAuditLog, "id" | "createdAt">): Promise<JobAuditLog> {
    const rows = await this.db.insert(jobAuditLog).values({
      id: crypto.randomUUID(),
      jobId: entry.jobId,
      userProfileId: entry.userProfileId,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      commentReason: entry.commentReason ?? null,
      createdAt: new Date(),
    }).returning()
    return mapRowToAuditLog(rows[0]!)
  }

  async findByJob(jobId: string): Promise<JobAuditLog[]> {
    const rows = await this.db.select().from(jobAuditLog)
      .where(eq(jobAuditLog.jobId, jobId))
      .orderBy(desc(jobAuditLog.createdAt))
    return rows.map(mapRowToAuditLog)
  }

  async findByUser(userId: string, limit?: number): Promise<JobAuditLog[]> {
    const query = this.db.select().from(jobAuditLog)
      .where(eq(jobAuditLog.userProfileId, userId))
      .orderBy(desc(jobAuditLog.createdAt))
    const rows = limit ? await query.limit(limit) : await query
    return rows.map(mapRowToAuditLog)
  }
}
