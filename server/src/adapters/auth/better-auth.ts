import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import type { IAuthProvider, SignInParams, SignUpParams, Session, UserProfile } from "shared"
import { InvalidCredentialsError } from "shared"

function createAuth(db: any) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: { enabled: true },
  })
}

export class BetterAuthAdapter implements IAuthProvider {
  private auth: ReturnType<typeof createAuth>

  constructor(db: any) {
    this.auth = createAuth(db)
  }

  async signIn(params: SignInParams): Promise<Session> {
    const data = await this.auth.api.signInEmail({ body: params })
    if (!data || !data.token) throw new InvalidCredentialsError()
    return {
      token: data.token,
      user: {
        id: data.user.id,
        authProviderId: data.user.id,
        email: data.user.email,
        firstName: data.user.name ?? "",
        lastName: "",
        branchId: "",
        isDeleted: false,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  }

  async signUp(params: SignUpParams): Promise<Session> {
    const data = await this.auth.api.signUpEmail({
      body: {
        email: params.email,
        password: params.password,
        name: `${params.firstName} ${params.lastName}`,
      },
    })
    if (!data || !data.token) throw new Error("Sign up failed")
    return {
      token: data.token,
      user: {
        id: data.user.id,
        authProviderId: data.user.id,
        email: data.user.email,
        firstName: params.firstName,
        lastName: params.lastName,
        branchId: params.branchId,
        isDeleted: false,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  }

  async signOut(sessionToken: string): Promise<void> {
    await this.auth.api.signOut({
      headers: new Headers({ Authorization: `Bearer ${sessionToken}` }),
    })
  }

  async getCurrentUser(sessionToken: string): Promise<UserProfile | null> {
    const session = await this.verifySession(sessionToken)
    return session?.user ?? null
  }

  async verifySession(sessionToken: string): Promise<Session | null> {
    try {
      const data = await this.auth.api.getSession({
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` }),
      })
      if (!data || !data.user) return null
      return {
        token: sessionToken,
        user: {
          id: data.user.id,
          authProviderId: data.user.id,
          email: data.user.email,
          firstName: data.user.name ?? "",
          lastName: "",
          branchId: "",
          isDeleted: false,
        },
        expiresAt: new Date(data.session.expiresAt),
      }
    } catch {
      return null
    }
  }

  async changePassword(_userId: string, _oldPassword: string, _newPassword: string): Promise<void> {
    throw new Error("Not implemented")
  }

  async adminResetPassword(_userId: string, _newPassword: string): Promise<void> {
    throw new Error("Not implemented")
  }
}
