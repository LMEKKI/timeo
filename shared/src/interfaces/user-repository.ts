import type { UserProfile, Permission, UserSetting, UserRole } from '../types'

export interface IUserRepository {
  findById(id: string): Promise<UserProfile | null>
  findByEmail(email: string): Promise<UserProfile | null>
  findByBranch(branchId: string): Promise<UserProfile[]>
  save(user: Omit<UserProfile, 'id'> & { id?: string }): Promise<UserProfile>
  softDelete(id: string): Promise<void>
  getPermissions(userId: string): Promise<Permission[]>
  setRole(userId: string, role: UserRole): Promise<void>
  getSettings(userId: string): Promise<UserSetting | null>
  updateSettings(userId: string, settings: Partial<UserSetting>): Promise<void>
}
