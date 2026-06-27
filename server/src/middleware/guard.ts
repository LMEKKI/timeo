import type { MiddlewareHandler } from "hono"
import { AppError } from "../lib/errors"
import type { AppVariables } from "../lib/types"

export const requireChef: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
	const user = c.get("user")
	if (!user) throw new AppError(401, "UNAUTHORIZED", "Non authentifié")
	if (user.role !== "chef") throw new AppError(403, "FORBIDDEN", "Accès réservé au chef")
	return next()
}
