import type { IUserRepository } from "shared"
import type { UserProfile } from "shared"

export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, UserProfile>()

  async findById(id: string): Promise<UserProfile | null> {
    return this.users.get(id) ?? null
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    return Array.from(this.users.values()).find(u => u.email === email) ?? null
  }

  async findByBranch(branchId: string): Promise<UserProfile[]> {
    return Array.from(this.users.values()).filter(u => u.branchId === branchId)
  }

  async save(user: UserProfile): Promise<UserProfile> {
    this.users.set(user.id, user)
    return user
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id)
  }
}
