import type { IUserRepository } from "shared"
import type { UserProfile, Permission, UserSetting, UserRole } from "shared"

export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, UserProfile>()
  private permissions = new Map<string, Permission[]>()
  private settings = new Map<string, UserSetting>()

  async findById(id: string): Promise<UserProfile | null> {
    return this.users.get(id) ?? null
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    return Array.from(this.users.values()).find(u => u.email === email) ?? null
  }

  async findByBranch(branchId: string): Promise<UserProfile[]> {
    return Array.from(this.users.values()).filter(u => u.branchId === branchId)
  }

  async save(user: Omit<UserProfile, 'id'> & { id?: string }): Promise<UserProfile> {
    const id = user.id ?? crypto.randomUUID()
    const saved: UserProfile = { ...user, id }
    this.users.set(id, saved)
    return saved
  }

  async softDelete(id: string): Promise<void> {
    const user = this.users.get(id)
    if (user) this.users.set(id, { ...user, isDeleted: true })
  }

  async getPermissions(userId: string): Promise<Permission[]> {
    return this.permissions.get(userId) ?? []
  }

  async setRole(userId: string, role: UserRole): Promise<void> {
    const existing = this.permissions.get(userId) ?? []
    this.permissions.set(userId, [
      ...existing.filter(p => p.userProfileId !== userId),
      { id: crypto.randomUUID(), userProfileId: userId, role },
    ])
  }

  async getSettings(userId: string): Promise<UserSetting | null> {
    return this.settings.get(userId) ?? null
  }

  async updateSettings(userId: string, settings: Partial<UserSetting>): Promise<void> {
    const existing = this.settings.get(userId) ?? {
      userProfileId: userId,
    }
    this.settings.set(userId, { ...existing, ...settings })
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id)
  }
}
