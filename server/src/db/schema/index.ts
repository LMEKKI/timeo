import { relations } from 'drizzle-orm'

import { company, branch } from './company'
import { userProfile, permission, userSetting } from './user'
import { customer } from './customer'
import { job, jobAssignment, consumedMaterial } from './job'
import { jobType, formTemplate, workflowConfig } from './form'
import { jobAuditLog, jobBillingSnapshot } from './audit'
import { companyConfig, systemConfig } from './config'

// ── Company ──────────────────────────────────────────────
export const companyRelations = relations(company, ({ many }) => ({
  branches: many(branch),
  jobTypes: many(jobType),
}))

// ── Branch ────────────────────────────────────────────────
export const branchRelations = relations(branch, ({ one, many }) => ({
  company: one(company, {
    fields: [branch.companyId],
    references: [company.id],
  }),
  userProfiles: many(userProfile),
  customers: many(customer),
  jobs: many(job),
}))

// ── User Profile ──────────────────────────────────────────
export const userProfileRelations = relations(userProfile, ({ one, many }) => ({
  branch: one(branch, {
    fields: [userProfile.branchId],
    references: [branch.id],
  }),
  permissions: many(permission),
  userSetting: one(userSetting),
  jobAssignments: many(jobAssignment),
  jobAuditLogs: many(jobAuditLog),
}))

// ── Permission ────────────────────────────────────────────
export const permissionRelations = relations(permission, ({ one }) => ({
  userProfile: one(userProfile, {
    fields: [permission.userProfileId],
    references: [userProfile.id],
  }),
}))

// ── User Setting ──────────────────────────────────────────
export const userSettingRelations = relations(userSetting, ({ one }) => ({
  userProfile: one(userProfile, {
    fields: [userSetting.userProfileId],
    references: [userProfile.id],
  }),
}))

// ── Customer ──────────────────────────────────────────────
export const customerRelations = relations(customer, ({ one, many }) => ({
  branch: one(branch, {
    fields: [customer.branchId],
    references: [branch.id],
  }),
  jobs: many(job),
}))

// ── Job Type ──────────────────────────────────────────────
export const jobTypeRelations = relations(jobType, ({ one, many }) => ({
  formTemplates: many(formTemplate),
  workflowConfigs: many(workflowConfig),
  company: one(company, {
    fields: [jobType.companyId],
    references: [company.id],
  }),
}))

// ── Form Template ─────────────────────────────────────────
export const formTemplateRelations = relations(formTemplate, ({ one }) => ({
  jobType: one(jobType, {
    fields: [formTemplate.jobTypeId],
    references: [jobType.id],
  }),
}))

// ── Workflow Config ───────────────────────────────────────
export const workflowConfigRelations = relations(workflowConfig, ({ one }) => ({
  jobType: one(jobType, {
    fields: [workflowConfig.jobTypeId],
    references: [jobType.id],
  }),
}))

// ── Job ───────────────────────────────────────────────────
export const jobRelations = relations(job, ({ one, many }) => ({
  branch: one(branch, {
    fields: [job.branchId],
    references: [branch.id],
  }),
  customer: one(customer, {
    fields: [job.customerId],
    references: [customer.id],
  }),
  consumedMaterials: many(consumedMaterial),
  jobAuditLogs: many(jobAuditLog),
  jobBillingSnapshot: one(jobBillingSnapshot),
  jobAssignments: many(jobAssignment),
}))

// ── Job Assignment ────────────────────────────────────────
export const jobAssignmentRelations = relations(jobAssignment, ({ one }) => ({
  job: one(job, {
    fields: [jobAssignment.jobId],
    references: [job.id],
  }),
  userProfile: one(userProfile, {
    fields: [jobAssignment.userProfileId],
    references: [userProfile.id],
  }),
}))

// ── Consumed Material ─────────────────────────────────────
export const consumedMaterialRelations = relations(consumedMaterial, ({ one }) => ({
  job: one(job, {
    fields: [consumedMaterial.jobId],
    references: [job.id],
  }),
}))

// ── Job Audit Log ─────────────────────────────────────────
export const jobAuditLogRelations = relations(jobAuditLog, ({ one }) => ({
  job: one(job, {
    fields: [jobAuditLog.jobId],
    references: [job.id],
  }),
  userProfile: one(userProfile, {
    fields: [jobAuditLog.userProfileId],
    references: [userProfile.id],
  }),
}))

// ── Job Billing Snapshot ──────────────────────────────────
export const jobBillingSnapshotRelations = relations(jobBillingSnapshot, ({ one }) => ({
  job: one(job, {
    fields: [jobBillingSnapshot.jobId],
    references: [job.id],
  }),
}))

// ── Barrel Exports ────────────────────────────────────────
export {
  company,
  branch,
  userProfile,
  permission,
  userSetting,
  customer,
  job,
  jobAssignment,
  consumedMaterial,
  jobType,
  formTemplate,
  workflowConfig,
  jobAuditLog,
  jobBillingSnapshot,
  companyConfig,
  systemConfig,
}
