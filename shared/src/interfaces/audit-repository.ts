import type { JobAuditLog } from '../types'

export interface IAuditRepository {
  log(entry: Omit<JobAuditLog, 'id' | 'createdAt'>): Promise<JobAuditLog>
  findByJob(jobId: string): Promise<JobAuditLog[]>
  findByUser(userId: string, limit?: number): Promise<JobAuditLog[]>
}
