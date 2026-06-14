import type { JobStatus } from '../constants/job-status'

export interface Job {
  id: string
  branchId: string
  jobTypeId: string
  formTemplateId: string
  customerId: string
  status: JobStatus
  version: number
  scheduledStartAt: Date
  createdAt: Date
}

export interface JobAssignment {
  jobId: string
  userProfileId: string
  isPrimary: boolean
}
