export const JobStatus = {
  SCHEDULED: 'SCHEDULED',
  EN_ROUTE: 'EN_ROUTE',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]

export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  SCHEDULED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}
