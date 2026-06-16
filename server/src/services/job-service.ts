import type { IJobRepository, IAuditRepository, IAuthProvider } from "shared"
import type { Job, JobStatus } from "shared"
import { JobNotFoundError, InvalidTransitionError, OptimisticLockError, MissingReasonError } from "shared"
import { VALID_TRANSITIONS } from "shared"

export class JobService {
  constructor(
    private jobRepo: IJobRepository,
    private auditRepo: IAuditRepository,
    private authProvider: IAuthProvider,
  ) {}

  async getJobById(jobId: string): Promise<Job> {
    const job = await this.jobRepo.findById(jobId)
    if (!job) throw new JobNotFoundError(jobId)
    return job
  }

  async getJobsByUser(_userId: string): Promise<Job[]> {
    return await this.jobRepo.findByStatus("SCHEDULED")
  }

  async transitionJob(jobId: string, newStatus: JobStatus, userId: string, reason?: string): Promise<Job> {
    const job = await this.jobRepo.findById(jobId)
    if (!job) throw new JobNotFoundError(jobId)

    const allowed = VALID_TRANSITIONS[job.status]
    if (!allowed || !allowed.includes(newStatus)) {
      throw new InvalidTransitionError(job.status, newStatus)
    }

    if (newStatus === "CANCELLED" && !reason) {
      throw new MissingReasonError("cancelling a job")
    }

    const updated = await this.jobRepo.updateStatus(jobId, newStatus, job.version)
    if (!updated) throw new OptimisticLockError()

    await this.auditRepo.log({
      jobId,
      userProfileId: userId,
      previousStatus: job.status,
      newStatus,
      commentReason: reason,
    })

    const result = await this.jobRepo.findById(jobId)
    if (!result) throw new JobNotFoundError(jobId)
    return result
  }
}
