import { pgTable, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core'

export const company = pgTable('company', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const branch = pgTable('branch', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => company.id),
  name: text('name').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
