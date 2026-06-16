import { describe, it, expect } from "bun:test"
import { InMemoryAuthProvider } from "./in-memory-auth-provider"
import { InvalidCredentialsError } from "shared"

describe("InMemoryAuthProvider", () => {
  it("should sign up and sign in", async () => {
    const provider = new InMemoryAuthProvider()
    await provider.signUp({
      email: "test@test.com",
      password: "123456",
      firstName: "Test",
      lastName: "User",
      branchId: "branch-1",
    })
    const session = await provider.signIn({ email: "test@test.com", password: "123456" })
    expect(session.user.email).toBe("test@test.com")
  })

  it("should reject invalid credentials", async () => {
    const provider = new InMemoryAuthProvider()
    await provider.signUp({
      email: "test@test.com",
      password: "123456",
      firstName: "Test",
      lastName: "User",
      branchId: "branch-1",
    })
    expect(provider.signIn({ email: "test@test.com", password: "wrong" })).rejects.toThrow(InvalidCredentialsError)
  })

  it("should sign out and invalidate session", async () => {
    const provider = new InMemoryAuthProvider()
    const session = await provider.signUp({
      email: "test@test.com",
      password: "123456",
      firstName: "Test",
      lastName: "User",
      branchId: "branch-1",
    })
    expect(await provider.getCurrentUser(session.token)).not.toBeNull()
    await provider.signOut(session.token)
    expect(await provider.getCurrentUser(session.token)).toBeNull()
  })
})
