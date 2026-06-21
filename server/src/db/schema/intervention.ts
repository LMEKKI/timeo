import { date, index, numeric, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core"
import { client, interlocuteur } from "./client"
import { prioriteEnum, statutInterventionEnum } from "./enums"

/**
 * Intervention (work order) in the field service system.
 *
 * Tracks a technician's visit to a client site through its lifecycle.
 * Uses soft-delete via `deletedAt` — queries must filter `isNull(deletedAt)`.
 *
 * Column naming follows the project convention: English.
 */
export const intervention = pgTable(
  "intervention",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    title: text("title").notNull(),
    description: text("description"),

    /** Client this intervention is for */
    clientId: uuid("client_id")
      .notNull()
      .references(() => client.id),

    /** Optional specific contact person at the client */
    interlocuteurId: uuid("interlocuteur_id").references(() => interlocuteur.id),

    /** Scheduled date and time window */
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time"),

    priorite: prioriteEnum("priorite"),
    statut: statutInterventionEnum("statut").notNull().default("non_planifiee"),

    /** Chef-only planning notes */
    chefNote: text("chef_note"),

    /** Denormalized address for historical accuracy */
    address: text("address"),
    lat: numeric("lat", { precision: 10, scale: 7 }),
    lng: numeric("lng", { precision: 10, scale: 7 }),

    deletedAt: timestamp("deleted_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_intervention_statut_date").on(table.statut, table.date),
    index("idx_intervention_client").on(table.clientId),
  ],
)
