import { pgTable, text, integer, boolean, jsonb } from 'drizzle-orm/pg-core'

export const companyConfig = pgTable('company_config', {
  companyId: text('company_id').primaryKey(),
  settings: jsonb('settings').$type<{
    gpsThresholdMeters: number
    snapshotRetentionYears: number
  }>().notNull(),
})

export const systemConfig = pgTable('system_config', {
  id: integer('id').primaryKey().default(1),
  minRequiredAppVersion: text('min_required_app_version').notNull(),
  isMaintenanceActive: boolean('is_maintenance_active').default(false).notNull(),
})
