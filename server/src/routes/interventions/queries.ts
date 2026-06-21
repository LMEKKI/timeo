import { and, count, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm"
import type { InterventionStatus } from "shared"
import { db } from "../../db"
import {
  intervention,
  interventionNote,
  interventionStatusHistory,
  interventionTechnician,
  client,
  address,
  user,
  userProfile,
} from "../../db/schema"
import type { CreateIntervention, UpdateIntervention } from "shared"

/**
 * ─── Queries ──────────────────────────────────────────────────────────────────
 * Direct Drizzle queries for intervention operations.
 * No service layer — just functions that return data.
 */

export async function findInterventions(filters: {
  statut?: string
  date?: string
  technicienId?: string
  priorite?: string
  search?: string
  techUserId?: string // filter by assigned tech
  page: number
  pageSize: number
}) {
  const conditions: ReturnType<typeof eq>[] = [isNull(intervention.deletedAt)]

  if (filters.statut) conditions.push(eq(intervention.statut, filters.statut as InterventionStatus))
  if (filters.date) conditions.push(eq(intervention.date, filters.date))
  if (filters.priorite) conditions.push(eq(intervention.priorite, filters.priorite))
  if (filters.search) conditions.push(ilike(intervention.title, `%${filters.search}%`))

  // Filter by assigned technician
  if (filters.technicienId || filters.techUserId) {
    const techId = filters.technicienId || filters.techUserId!
    const assignedIds = db
      .select({ interventionId: interventionTechnician.interventionId })
      .from(interventionTechnician)
      .where(eq(interventionTechnician.userId, techId))
    conditions.push(inArray(intervention.id, assignedIds))
  }

  const where = and(...conditions)

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: intervention.id,
        title: intervention.title,
        statut: intervention.statut,
        priorite: intervention.priorite,
        date: intervention.date,
        startTime: intervention.startTime,
        endTime: intervention.endTime,
        address: intervention.address,
        createdAt: intervention.createdAt,
        clientName: client.name,
      })
      .from(intervention)
      .leftJoin(client, eq(intervention.clientId, client.id))
      .where(where)
      .orderBy(desc(intervention.createdAt))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize),
    db.select({ count: count() }).from(intervention).where(where),
  ])

  return {
    data: rows,
    meta: {
      total: Number(totalResult[0].count),
      page: filters.page,
      pageSize: filters.pageSize,
    },
  }
}

export async function findInterventionById(id: string) {
  const [row] = await db
    .select({
      intervention: intervention,
      client: client,
      address: address,
    })
    .from(intervention)
    .leftJoin(client, eq(intervention.clientId, client.id))
    .leftJoin(address, eq(client.addressId, address.id))
    .where(and(eq(intervention.id, id), isNull(intervention.deletedAt)))
    .limit(1)

  if (!row) return null

  const [techs, notes] = await Promise.all([
    db
      .select({
        userId: user.id,
        name: user.name,
        username: user.username,
      })
      .from(interventionTechnician)
      .innerJoin(user, eq(interventionTechnician.userId, user.id))
      .where(eq(interventionTechnician.interventionId, id)),
    db
      .select({
        id: interventionNote.id,
        content: interventionNote.content,
        userId: interventionNote.userId,
        userName: user.name,
        createdAt: interventionNote.createdAt,
      })
      .from(interventionNote)
      .leftJoin(user, eq(interventionNote.userId, user.id))
      .where(eq(interventionNote.interventionId, id))
      .orderBy(desc(interventionNote.createdAt)),
  ])

  return {
    ...row.intervention,
    client: row.client,
    clientAddress: row.address,
    techniciens: techs,
    notes,
  }
}

export async function createIntervention(data: CreateIntervention) {
  const [row] = await db
    .insert(intervention)
    .values({
      title: data.title,
      description: data.description,
      clientId: data.clientId,
      interlocuteurId: data.interlocuteurId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      priorite: data.priorite,
      address: data.address,
    })
    .returning()

  return row
}

export async function updateIntervention(id: string, data: UpdateIntervention) {
  const [row] = await db
    .update(intervention)
    .set(data)
    .where(eq(intervention.id, id))
    .returning()

  return row
}

export async function softDeleteIntervention(id: string) {
  await db
    .update(intervention)
    .set({ deletedAt: sql`now()` })
    .where(eq(intervention.id, id))
}

export async function transitionStatus(
  id: string,
  newStatus: InterventionStatus,
  changedById: string,
  reason?: string,
) {
  const [current] = await db
    .select({ statut: intervention.statut })
    .from(intervention)
    .where(eq(intervention.id, id))
    .limit(1)

  if (!current) return null

  // Update intervention status
  const [updated] = await db
    .update(intervention)
    .set({ statut: newStatus })
    .where(eq(intervention.id, id))
    .returning()

  // Record audit trail
  await db.insert(interventionStatusHistory).values({
    interventionId: id,
    previousStatus: current.statut,
    newStatus,
    changedById,
    reason,
  })

  return updated
}

export async function assignTechnicians(interventionId: string, userIds: string[]) {
  await db.insert(interventionTechnician).values(
    userIds.map((userId) => ({ interventionId, userId })),
  )
}

export async function removeTechnician(interventionId: string, userId: string) {
  await db
    .delete(interventionTechnician)
    .where(
      and(
        eq(interventionTechnician.interventionId, interventionId),
        eq(interventionTechnician.userId, userId),
      ),
    )
}

export async function getAssignedTechIds(interventionId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: interventionTechnician.userId })
    .from(interventionTechnician)
    .where(eq(interventionTechnician.interventionId, interventionId))

  return rows.map((r) => r.userId)
}

export async function addNote(interventionId: string, userId: string, content: string) {
  const [row] = await db
    .insert(interventionNote)
    .values({ interventionId, userId, content })
    .returning()

  return row
}

export async function getNotes(interventionId: string) {
  return db
    .select({
      id: interventionNote.id,
      content: interventionNote.content,
      userId: interventionNote.userId,
      userName: user.name,
      createdAt: interventionNote.createdAt,
    })
    .from(interventionNote)
    .leftJoin(user, eq(interventionNote.userId, user.id))
    .where(eq(interventionNote.interventionId, interventionId))
    .orderBy(desc(interventionNote.createdAt))
}

export async function getStatusHistory(interventionId: string) {
  return db
    .select({
      id: interventionStatusHistory.id,
      previousStatus: interventionStatusHistory.previousStatus,
      newStatus: interventionStatusHistory.newStatus,
      changedById: interventionStatusHistory.changedById,
      changedByName: user.name,
      reason: interventionStatusHistory.reason,
      createdAt: interventionStatusHistory.createdAt,
    })
    .from(interventionStatusHistory)
    .leftJoin(user, eq(interventionStatusHistory.changedById, user.id))
    .where(eq(interventionStatusHistory.interventionId, interventionId))
    .orderBy(desc(interventionStatusHistory.createdAt))
}
