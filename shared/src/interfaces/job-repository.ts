import type { Job } from '../types'
import type { JobStatus } from '../constants'

export interface PaginationOpts {
  limit: number
  offset: number
}

export interface IJobRepository {
  findById(id: string): Promise<Job | null>
  findByBranch(branchId: string, opts?: PaginationOpts): Promise<Job[]>
  findByStatus(status: JobStatus, opts?: PaginationOpts): Promise<Job[]>
  save(job: Omit<Job, 'createdAt'>): Promise<Job>
  updateStatus(id: string, newStatus: JobStatus, expectedVersion: number): Promise<boolean>
  assignTechnician(jobId: string, userId: string, isPrimary: boolean): Promise<void>
  removeTechnician(jobId: string, userId: string): Promise<void>
  delete(id: string): Promise<void>
}
