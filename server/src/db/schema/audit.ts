import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { job } from './job'
import { userProfile } from './user'

export const jobAuditLog = pgTable('job_audit_log', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => job.id),
  userProfileId: text('user_profile_id').notNull().references(() => userProfile.id),
  previousStatus: text('previous_status').notNull(),
  newStatus: text('new_status').notNull(),
  commentReason: text('comment_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const jobBillingSnapshot = pgTable('job_billing_snapshot', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().unique().references(() => job.id),
  historicalCustomerName: text('historical_customer_name').notNull(),
  historicalAddressRaw: text('historical_address_raw').notNull(),
  historicalFormResponses: jsonb('historical_form_responses').$type<Record<string, unknown>>().notNull(),
  customerSignatureHash: text('customer_signature_hash').notNull(),
  sealedAt: timestamp('sealed_at').notNull(),
})
