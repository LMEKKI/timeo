import { z } from "zod"
import type { InterventionStatus } from "shared"
import { canTransition, createInterventionSchema, updateInterventionSchema } from "shared"
import { factory } from "../../lib/hono"
import { requireAuth, requireRole } from "../../middleware/auth"
import { zValidate } from "../../middleware/validate"
import * as Q from "./queries"
import { forbidden, notFound, conflict } from "../../lib/errors"

/**
 * Intervention routes.
 *
 * All routes require authentication. Chef-only actions are guarded
 * by `requireRole("chef")`. Techs can only see/act on their assigned
 * interventions.
 */

const app = factory.createApp()

// ─── Query params schema ──────────────────────────────────────────────────────

const listQuerySchema = z.object({
  statut: z.string().optional(),
  date: z.string().optional(),
  technicienId: z.string().optional(),
  priorite: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const transitionSchema = z.object({
  statut: z.enum([
    "non_planifiee",
    "planifiee",
    "en_route",
    "en_cours",
    "terminee",
    "annulee",
  ]),
  reason: z.string().max(500).optional(),
})

const assignSchema = z.object({
  userIds: z.array(z.string()).min(1).max(5),
})

const noteSchema = z.object({
  content: z.string().min(1).max(2000),
})

const paramSchema = z.object({
  id: z.string(),
})

// ─── GET /api/interventions — List interventions ──────────────────────────────

app.get("/", requireAuth, async (c) => {
  const params = listQuerySchema.parse(c.req.query())
  const role = c.var.userRole
  const userId = c.var.userId

  const result = await Q.findInterventions({
    ...params,
    // Techs only see their assigned interventions
    techUserId: role === "tech" ? userId : undefined,
  })

  return c.json({ success: true, data: result.data, meta: result.meta }, 200)
})

// ─── POST /api/interventions — Create intervention ────────────────────────────

app.post("/", requireAuth, requireRole("chef"), zValidate("json", createInterventionSchema), async (c) => {
  const data = c.var.validated as typeof createInterventionSchema._type
  const intervention = await Q.createIntervention(data)
  return c.json({ success: true, data: intervention }, 201)
})

// ─── GET /api/interventions/:id — Get intervention detail ─────────────────────

app.get("/:id", requireAuth, async (c) => {
  const { id } = c.req.param()
  const role = c.var.userRole
  const userId = c.var.userId

  const result = await Q.findInterventionById(id)
  if (!result) return notFound(c, "Intervention introuvable")

  // Techs can only see interventions they're assigned to
  if (role === "tech") {
    const assignedIds = await Q.getAssignedTechIds(id)
    if (!assignedIds.includes(userId)) {
      return forbidden(c, "Vous n'êtes pas assigné à cette intervention")
    }
  }

  return c.json({ success: true, data: result }, 200)
})

// ─── PUT /api/interventions/:id — Update intervention ─────────────────────────

app.put("/:id", requireAuth, requireRole("chef"), zValidate("json", updateInterventionSchema), async (c) => {
  const { id } = c.req.param()
  const data = c.var.validated as typeof updateInterventionSchema._type

  const existing = await Q.findInterventionById(id)
  if (!existing) return notFound(c, "Intervention introuvable")

  const updated = await Q.updateIntervention(id, data)
  return c.json({ success: true, data: updated }, 200)
})

// ─── DELETE /api/interventions/:id — Soft delete ──────────────────────────────

app.delete("/:id", requireAuth, requireRole("chef"), async (c) => {
  const { id } = c.req.param()
  const existing = await Q.findInterventionById(id)
  if (!existing) return notFound(c, "Intervention introuvable")

  await Q.softDeleteIntervention(id)
  return c.body(null, 204)
})

// ─── PATCH /api/interventions/:id/statut — Transition status ──────────────────

app.patch("/:id/statut", requireAuth, zValidate("json", transitionSchema), async (c) => {
  const { id } = c.req.param()
  const { statut: newStatus, reason } = c.var.validated as {
    statut: InterventionStatus
    reason?: string
  }
  const role = c.var.userRole
  const userId = c.var.userId

  const intervention = await Q.findInterventionById(id)
  if (!intervention) return notFound(c, "Intervention introuvable")

  const currentStatus = intervention.statut as InterventionStatus

  // Validate the transition is valid
  if (!canTransition(currentStatus, newStatus)) {
    return conflict(c, `Transition impossible: ${currentStatus} → ${newStatus}`)
  }

  // Tech needs to be assigned to transition
  if (role === "tech") {
    const assignedIds = await Q.getAssignedTechIds(id)
    if (!assignedIds.includes(userId)) {
      return forbidden(c, "Vous n'êtes pas assigné à cette intervention")
    }

    // Tech can only transition en_route → en_cours → terminee
    const techTransitions: InterventionStatus[] = ["en_cours", "terminee"]
    if (!techTransitions.includes(newStatus)) {
      return forbidden(c, "Seul le chef peut effectuer cette transition")
    }
  }

  // Chef can cancel from any status except terminee
  if (role === "chef" && newStatus === "annulee" && currentStatus === "terminee") {
    return conflict(c, "Impossible d'annuler une intervention terminée")
  }

  // Reason required for cancellation
  if (newStatus === "annulee" && !reason) {
    return conflict(c, "Un motif est requis pour annuler")
  }

  const updated = await Q.transitionStatus(id, newStatus, userId, reason)
  if (!updated) return notFound(c, "Intervention introuvable")

  return c.json({ success: true, data: { id: updated.id, statut: updated.statut } }, 200)
})

// ─── POST /api/interventions/:id/assign — Assign technicians ──────────────────

app.post("/:id/assign", requireAuth, requireRole("chef"), zValidate("json", assignSchema), async (c) => {
  const { id } = c.req.param()
  const { userIds } = c.var.validated as { userIds: string[] }

  const existing = await Q.findInterventionById(id)
  if (!existing) return notFound(c, "Intervention introuvable")

  await Q.assignTechnicians(id, userIds)
  return c.json({ success: true, data: { assigned: userIds } }, 200)
})

// ─── DELETE /api/interventions/:id/assign/:userId — Remove technician ─────────

app.delete("/:id/assign/:userId", requireAuth, requireRole("chef"), async (c) => {
  const { id, userId } = c.req.param()
  await Q.removeTechnician(id, userId)
  return c.body(null, 204)
})

// ─── POST /api/interventions/:id/notes — Add note (tech only) ─────────────────

app.post("/:id/notes", requireAuth, requireRole("tech"), zValidate("json", noteSchema), async (c) => {
  const { id } = c.req.param()
  const { content } = c.var.validated as { content: string }
  const userId = c.var.userId

  // Verify the tech is assigned
  const assignedIds = await Q.getAssignedTechIds(id)
  if (!assignedIds.includes(userId)) {
    return forbidden(c, "Vous n'êtes pas assigné à cette intervention")
  }

  const note = await Q.addNote(id, userId, content)
  return c.json({ success: true, data: note }, 201)
})

// ─── GET /api/interventions/:id/notes — Get notes ─────────────────────────────

app.get("/:id/notes", requireAuth, async (c) => {
  const { id } = c.req.param()
  const role = c.var.userRole
  const userId = c.var.userId

  // Techs can only see notes for their assigned interventions
  if (role === "tech") {
    const assignedIds = await Q.getAssignedTechIds(id)
    if (!assignedIds.includes(userId)) {
      return forbidden(c, "Vous n'êtes pas assigné à cette intervention")
    }
  }

  const notes = await Q.getNotes(id)
  return c.json({ success: true, data: notes }, 200)
})

// ─── GET /api/interventions/:id/history — Get status history ──────────────────

app.get("/:id/history", requireAuth, async (c) => {
  const { id } = c.req.param()
  const role = c.var.userRole
  const userId = c.var.userId

  // Techs can only see history for their assigned interventions
  if (role === "tech") {
    const assignedIds = await Q.getAssignedTechIds(id)
    if (!assignedIds.includes(userId)) {
      return forbidden(c, "Vous n'êtes pas assigné à cette intervention")
    }
  }

  const history = await Q.getStatusHistory(id)
  return c.json({ success: true, data: history }, 200)
})

export default app
