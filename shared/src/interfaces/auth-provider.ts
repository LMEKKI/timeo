import type { UserProfile } from '../types'

export interface SignInParams {
  email: string
  password: string
}

export interface SignUpParams {
  email: string
  password: string
  firstName: string
  lastName: string
  branchId: string
}

export interface Session {
  token: string
  user: UserProfile
  expiresAt: Date
}

export interface IAuthProvider {
  signIn(params: SignInParams): Promise<Session>
  signUp(params: SignUpParams): Promise<Session>
  signOut(sessionToken: string): Promise<void>
  getCurrentUser(sessionToken: string): Promise<UserProfile | null>
  verifySession(sessionToken: string): Promise<Session | null>
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
  adminResetPassword(userId: string, newPassword: string): Promise<void>
}
