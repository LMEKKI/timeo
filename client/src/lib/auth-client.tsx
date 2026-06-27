import { createContext, useContext, type ReactNode } from "react"
import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { UserWithRole } from "better-auth/client/plugins"

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
	fetchOptions: { credentials: "include" },
	plugins: [usernameClient()],
})

type SessionUser = NonNullable<typeof authClient.$Infer.Session.user>
type User = (SessionUser & UserWithRole & { mustChangePassword?: boolean }) | null

export type AuthContext = {
	user: User
	isLoading: boolean
	mustChangePassword: boolean
	signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient()
	const { data, isLoading } = useQuery({
		queryKey: ["auth", "session"],
		queryFn: async () => {
			const { data: session } = await authClient.getSession()
			return session
		},
		staleTime: 60_000,
	})

	const signOut = async () => {
		await authClient.signOut()
		await queryClient.invalidateQueries({ queryKey: ["auth"] })
	}

	const value: AuthContext = {
		user: (data?.user ?? null) as User,
		isLoading,
		mustChangePassword: (data?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword ?? false,
		signOut,
	}

	return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth(): AuthContext {
	const ctx = useContext(AuthCtx)
	if (!ctx) throw new Error("useAuth must be used within AuthProvider")
	return ctx
}
