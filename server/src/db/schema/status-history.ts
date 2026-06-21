import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "./better-auth"
import { statutInterventionEnum } from "./enums"
import { intervention } from "./intervention"

/**
 * Audit trail for every status change on an intervention.
 *
 * Each transition creates a row recording who, what, when, and why.
 * The `reason` field is required when cancelling.
 */
export const interventionStatusHistory = pgTable(
  "intervention_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    interventionId: uuid("intervention_id")
      .notNull()
      .references(() => intervention.id, { onDelete: "cascade" }),

    previousStatus: statutInterventionEnum("previous_status"),
    newStatus: statutInterventionEnum("new_status").notNull(),

    changedById: text("changed_by_id")
      .notNull()
      .references(() => user.id),

    reason: text("reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_status_history_intervention").on(table.interventionId),
  ],
)
