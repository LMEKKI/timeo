import { eq, and, sql } from "drizzle-orm"
import type { IJobRepository, PaginationOpts } from "shared"
import type { Job, JobStatus } from "shared"
import type { DrizzleDB } from "../../db"
import { job as jobTable, jobAssignment } from "../../db/schema/job"

function mapRowToJob(row: typeof jobTable.$inferSelect): Job {
  return {
    id: row.id,
    branchId: row.branchId,
    jobTypeId: row.jobTypeId,
    formTemplateId: row.formTemplateId,
    customerId: row.customerId,
    status: row.status as JobStatus,
    version: row.version,
    scheduledStartAt: row.scheduledStartAt,
    createdAt: row.createdAt,
  }
}

export class DrizzleJobRepository implements IJobRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: string): Promise<Job | null> {
    const rows = await this.db.select().from(jobTable).where(eq(jobTable.id, id)).limit(1)
    const row = rows[0]
    return row ? mapRowToJob(row) : null
  }

  async findByBranch(branchId: string, opts?: PaginationOpts): Promise<Job[]> {
    const query = this.db.select().from(jobTable).where(eq(jobTable.branchId, branchId))
    const rows = opts ? await query.limit(opts.limit).offset(opts.offset) : await query
    return rows.map(mapRowToJob)
  }

  async findByStatus(status: JobStatus, opts?: PaginationOpts): Promise<Job[]> {
    const query = this.db.select().from(jobTable).where(eq(jobTable.status, status))
    const rows = opts ? await query.limit(opts.limit).offset(opts.offset) : await query
    return rows.map(mapRowToJob)
  }

  async save(input: Omit<Job, "createdAt">): Promise<Job> {
    const rows = await this.db.insert(jobTable).values({
      id: input.id,
      branchId: input.branchId,
      jobTypeId: input.jobTypeId,
      formTemplateId: input.formTemplateId,
      customerId: input.customerId,
      status: input.status,
      version: input.version,
      scheduledStartAt: input.scheduledStartAt,
      createdAt: new Date(),
    }).returning()
    return mapRowToJob(rows[0]!)
  }

  async updateStatus(id: string, newStatus: JobStatus, expectedVersion: number): Promise<boolean> {
    const rows = await this.db.update(jobTable)
      .set({
        status: newStatus,
        version: sql`${jobTable.version} + 1`,
      })
      .where(and(eq(jobTable.id, id), eq(jobTable.version, expectedVersion)))
      .returning()
    return rows.length > 0
  }

  async assignTechnician(jobId: string, userId: string, isPrimary: boolean): Promise<void> {
    await this.db.insert(jobAssignment).values({ jobId, userProfileId: userId, isPrimary })
  }

  async removeTechnician(jobId: string, userId: string): Promise<void> {
    await this.db.delete(jobAssignment)
      .where(and(eq(jobAssignment.jobId, jobId), eq(jobAssignment.userProfileId, userId)))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(jobTable).where(eq(jobTable.id, id))
  }
}
