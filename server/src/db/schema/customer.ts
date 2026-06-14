import { pgTable, text, boolean } from 'drizzle-orm/pg-core'
import { branch } from './company'

export const customer = pgTable('customer', {
  id: text('id').primaryKey(),
  branchId: text('branch_id').notNull().references(() => branch.id),
  name: text('name').notNull(),
  billingAddress: text('billing_address').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
})
