import { z } from 'zod'
import { JobStatusEnum } from './job'

export const JobAuditLogSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  userProfileId: z.string(),
  previousStatus: JobStatusEnum,
  newStatus: JobStatusEnum,
  commentReason: z.string().optional(),
  createdAt: z.date(),
})
export type JobAuditLogDTO = z.infer<typeof JobAuditLogSchema>

export const JobBillingSnapshotSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  historicalCustomerName: z.string().min(1),
  historicalAddressRaw: z.string().min(1),
  historicalFormResponses: z.record(z.string(), z.any()),
  customerSignatureHash: z.string(),
  sealedAt: z.date(),
})
export type JobBillingSnapshotDTO = z.infer<typeof JobBillingSnapshotSchema>
