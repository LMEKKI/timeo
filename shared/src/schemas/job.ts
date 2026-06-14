import { z } from 'zod'
import { JobStatus } from '../constants'

export const JobStatusEnum = z.enum([
  JobStatus.SCHEDULED,
  JobStatus.EN_ROUTE,
  JobStatus.IN_PROGRESS,
  JobStatus.PENDING_APPROVAL,
  JobStatus.COMPLETED,
  JobStatus.CANCELLED,
])

export const JobSchema = z.object({
  id: z.string(),
  branchId: z.string(),
  jobTypeId: z.string(),
  formTemplateId: z.string(),
  customerId: z.string(),
  status: JobStatusEnum,
  version: z.number().int().min(0),
  scheduledStartAt: z.date(),
  createdAt: z.date(),
})
export type JobDTO = z.infer<typeof JobSchema>

export const CreateJobSchema = z.object({
  branchId: z.string(),
  jobTypeId: z.string(),
  formTemplateId: z.string(),
  customerId: z.string(),
  scheduledStartAt: z.string().datetime(),
})
export type CreateJobDTO = z.infer<typeof CreateJobSchema>

export const UpdateJobStatusSchema = z.object({
  status: JobStatusEnum,
  version: z.number().int().min(0),
  commentReason: z.string().optional(),
  // GPS coordinates for geofencing validation
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
  formResponses: z.record(z.string(), z.any()).optional(),
})
export type UpdateJobStatusDTO = z.infer<typeof UpdateJobStatusSchema>

export const JobAssignmentSchema = z.object({
  jobId: z.string(),
  userProfileId: z.string(),
  isPrimary: z.boolean(),
})
export type JobAssignmentDTO = z.infer<typeof JobAssignmentSchema>
