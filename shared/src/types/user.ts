export type UserRole = 'GLOBAL_ADMIN' | 'BRANCH_MANAGER' | 'FIELD_TECHNICIAN'

export interface UserProfile {
  id: string
  authProviderId: string
  branchId: string
  firstName: string
  lastName: string
  email: string
  isDeleted: boolean
}

export interface Permission {
  id: string
  userProfileId: string
  role: UserRole
}

export interface UserSetting {
  userProfileId: string
  pushNotificationToken?: string
  lastLoginAt?: Date
  settings?: Record<string, unknown>
}
