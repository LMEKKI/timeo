import type { auth } from "../auth"

export type SessionUser = typeof auth.$Infer.Session.user
export type SessionRecord = typeof auth.$Infer.Session.session

export type AppVariables = {
	user: SessionUser | null
	session: SessionRecord | null
}
