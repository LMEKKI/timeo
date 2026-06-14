import { pgTable, text, boolean, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { branch } from './company'

export const userRoleEnum = pgEnum('user_role', ['GLOBAL_ADMIN', 'BRANCH_MANAGER', 'FIELD_TECHNICIAN'])

export const userProfile = pgTable('user_profile', {
  id: text('id').primaryKey(),
  authProviderId: text('auth_provider_id').notNull().unique(),
  branchId: text('branch_id').notNull().references(() => branch.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
})

export const permission = pgTable('permission', {
  id: text('id').primaryKey(),
  userProfileId: text('user_profile_id').notNull().references(() => userProfile.id),
  role: userRoleEnum('role').notNull(),
})

export const userSetting = pgTable('user_setting', {
  userProfileId: text('user_profile_id').primaryKey().references(() => userProfile.id),
  pushNotificationToken: text('push_notification_token'),
  lastLoginAt: timestamp('last_login_at'),
  settings: jsonb('settings').$type<Record<string, unknown>>(),
})
