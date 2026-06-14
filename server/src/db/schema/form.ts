import { pgTable, text, integer, boolean, jsonb } from 'drizzle-orm/pg-core'

export const jobType = pgTable('job_type', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  name: text('name').notNull(),
  estimatedDurationMinutes: integer('estimated_duration_minutes'),
})

export const formTemplate = pgTable('form_template', {
  id: text('id').primaryKey(),
  jobTypeId: text('job_type_id').notNull().references(() => jobType.id),
  version: integer('version').notNull(),
  title: text('title').notNull(),
  questionSchema: jsonb('question_schema').$type<Record<string, unknown>>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
})

export const workflowConfig = pgTable('workflow_config', {
  id: text('id').primaryKey(),
  jobTypeId: text('job_type_id').notNull().references(() => jobType.id),
  engineType: text('engine_type').notNull(),
  approvalRequired: boolean('approval_required').default(false).notNull(),
})
