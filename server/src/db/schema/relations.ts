import { relations } from "drizzle-orm"

import { account, session, user } from "./better-auth"
import { client, interlocuteur } from "./client"
import { address } from "./address"
import { intervention } from "./intervention"
import { interventionNote } from "./intervention-notes"
import { interventionTechnician } from "./intervention-technician"
import { interventionStatusHistory } from "./status-history"
import { userProfile } from "./user-profile"

// ─────────────────────────────────────────────────────────────────────────────
// Better Auth — extended with Timeo profile
// ─────────────────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  profile: one(userProfile),
  assignedInterventions: many(interventionTechnician),
  notes: many(interventionNote),
  statusChanges: many(interventionStatusHistory),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

// ─────────────────────────────────────────────────────────────────────────────
// User Profile (1:1 with user)
// ─────────────────────────────────────────────────────────────────────────────

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Address
// ─────────────────────────────────────────────────────────────────────────────

export const addressRelations = relations(address, ({ many }) => ({
  clients: many(client),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────────────────────

export const clientRelations = relations(client, ({ one, many }) => ({
  address: one(address, {
    fields: [client.addressId],
    references: [address.id],
  }),
  interlocuteurs: many(interlocuteur),
  interventions: many(intervention),
}))

export const interlocuteurRelations = relations(interlocuteur, ({ one }) => ({
  client: one(client, {
    fields: [interlocuteur.clientId],
    references: [client.id],
  }),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Intervention
// ─────────────────────────────────────────────────────────────────────────────

export const interventionRelations = relations(intervention, ({ one, many }) => ({
  client: one(client, {
    fields: [intervention.clientId],
    references: [client.id],
  }),
  techniciens: many(interventionTechnician),
  notes: many(interventionNote),
  statusHistory: many(interventionStatusHistory),
}))

export const interventionTechnicianRelations = relations(
  interventionTechnician,
  ({ one }) => ({
    intervention: one(intervention, {
      fields: [interventionTechnician.interventionId],
      references: [intervention.id],
    }),
    user: one(user, {
      fields: [interventionTechnician.userId],
      references: [user.id],
    }),
  }),
)

export const interventionNoteRelations = relations(interventionNote, ({ one }) => ({
  intervention: one(intervention, {
    fields: [interventionNote.interventionId],
    references: [intervention.id],
  }),
  user: one(user, {
    fields: [interventionNote.userId],
    references: [user.id],
  }),
}))

export const interventionStatusHistoryRelations = relations(
  interventionStatusHistory,
  ({ one }) => ({
    intervention: one(intervention, {
      fields: [interventionStatusHistory.interventionId],
      references: [intervention.id],
    }),
    changedBy: one(user, {
      fields: [interventionStatusHistory.changedById],
      references: [user.id],
    }),
  }),
)
