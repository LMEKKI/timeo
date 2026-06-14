import type { JobStatus } from '../constants/job-status'

export interface JobAuditLog {
  id: string
  jobId: string
  userProfileId: string
  previousStatus: JobStatus
  newStatus: JobStatus
  commentReason?: string
  createdAt: Date
}

export interface JobBillingSnapshot {
  id: string
  jobId: string
  historicalCustomerName: string
  historicalAddressRaw: string
  historicalFormResponses: Record<string, unknown>
  customerSignatureHash: string
  sealedAt: Date
}
