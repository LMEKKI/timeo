import type { IAuthProvider, SignInParams, SignUpParams, Session, UserProfile } from "shared"
import { InvalidCredentialsError } from "shared"

export class InMemoryAuthProvider implements IAuthProvider {
  private users = new Map<string, { password: string; profile: UserProfile }>()
  private sessions = new Map<string, { userId: string; expiresAt: Date }>()

  async signIn(params: SignInParams): Promise<Session> {
    const user = Array.from(this.users.values()).find(u => u.profile.email === params.email)
    if (!user || user.password !== params.password) throw new InvalidCredentialsError()
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    this.sessions.set(token, { userId: user.profile.id, expiresAt })
    return { token, user: user.profile, expiresAt }
  }

  async signUp(params: SignUpParams): Promise<Session> {
    const id = crypto.randomUUID()
    const profile: UserProfile = {
      id,
      authProviderId: id,
      branchId: params.branchId,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      isDeleted: false,
    }
    this.users.set(id, { password: params.password, profile })
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    this.sessions.set(token, { userId: id, expiresAt })
    return { token, user: profile, expiresAt }
  }

  async signOut(sessionToken: string): Promise<void> {
    this.sessions.delete(sessionToken)
  }

  async getCurrentUser(sessionToken: string): Promise<UserProfile | null> {
    const session = this.sessions.get(sessionToken)
    if (!session || session.expiresAt < new Date()) return null
    const user = this.users.get(session.userId)
    return user?.profile ?? null
  }

  async verifySession(sessionToken: string): Promise<Session | null> {
    const session = this.sessions.get(sessionToken)
    if (!session || session.expiresAt < new Date()) return null
    const user = this.users.get(session.userId)
    if (!user) return null
    return { token: sessionToken, user: user.profile, expiresAt: session.expiresAt }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = this.users.get(userId)
    if (!user || user.password !== oldPassword) throw new InvalidCredentialsError()
    this.users.set(userId, { ...user, password: newPassword })
  }

  async adminResetPassword(userId: string, newPassword: string): Promise<void> {
    const user = this.users.get(userId)
    if (!user) return
    this.users.set(userId, { ...user, password: newPassword })
  }
}
