import { and, eq, inArray, isNull } from "drizzle-orm"
import { Hono } from "hono"
import { proximityGroupSchema } from "@shared/schemas/intervention"
import { db } from "../db"
import { addresses, interventions } from "../db/schema"
import { AppError } from "../lib/errors"
import type { AppVariables } from "../lib/types"
import { requireChef } from "../middleware/guard"
import { groupByProximity, type InterventionPoint } from "../services/proximity"

export const proximityRoute = new Hono<{ Variables: AppVariables }>()
	.use("*", requireChef)
	.post("/group", async (c) => {
		const parsed = proximityGroupSchema.safeParse(await c.req.json())
		if (!parsed.success) {
			const first = parsed.error.issues[0]
			throw new AppError(
				400,
				"VALIDATION_ERROR",
				first?.message ?? "Données invalides",
				first?.path[0]?.toString(),
			)
		}

		const result = await db
			.select({
				id: interventions.id,
				title: interventions.title,
				date: interventions.date,
				latitude: addresses.latitude,
				longitude: addresses.longitude,
			})
			.from(interventions)
			.leftJoin(addresses, eq(interventions.addressId, addresses.id))
			.where(and(inArray(interventions.id, parsed.data.interventionIds), isNull(interventions.deletedAt)))

		const points: InterventionPoint[] = result
			.filter((r): r is typeof r & { latitude: string; longitude: string } =>
				Boolean(r.latitude && r.longitude),
			)
			.map((r) => ({
				id: r.id,
				title: r.title,
				date: r.date,
				coordinates: { latitude: Number(r.latitude), longitude: Number(r.longitude) },
			}))

		const groups = groupByProximity(points, parsed.data.maxDistanceKm)
		return c.json({ data: groups })
	})
