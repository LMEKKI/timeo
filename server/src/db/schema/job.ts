import { pgTable, text, integer, boolean, timestamp, doublePrecision, index } from 'drizzle-orm/pg-core'
import { branch } from './company'
import { customer } from './customer'
import { userProfile } from './user'

export const job = pgTable('job', {
  id: text('id').primaryKey(),
  branchId: text('branch_id').notNull().references(() => branch.id),
  jobTypeId: text('job_type_id').notNull(),
  formTemplateId: text('form_template_id').notNull(),
  customerId: text('customer_id').notNull().references(() => customer.id),
  status: text('status').notNull().$type<'SCHEDULED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'COMPLETED' | 'CANCELLED'>(),
  version: integer('version').default(0).notNull(),
  scheduledStartAt: timestamp('scheduled_start_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('idx_job_status').on(table.status),
  branchIdx: index('idx_job_branch_id').on(table.branchId),
  scheduledAtIdx: index('idx_job_scheduled_at').on(table.scheduledStartAt),
  customerIdx: index('idx_job_customer_id').on(table.customerId),
}))

export const jobAssignment = pgTable('job_assignment', {
  jobId: text('job_id').notNull().references(() => job.id),
  userProfileId: text('user_profile_id').notNull().references(() => userProfile.id),
  isPrimary: boolean('is_primary').notNull().default(false),
}, (table) => ({
  pk: { columns: [table.jobId, table.userProfileId] },
}))

export const consumedMaterial = pgTable('consumed_material', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => job.id),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  internalReference: text('internal_reference'),
})
