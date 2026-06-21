import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "./better-auth"
import { intervention } from "./intervention"

/**
 * Append-only technician notes on an intervention.
 *
 * Notes are immutable once created — provides an audit trail.
 * A separate concept from `chefNote` on the intervention itself.
 */
export const interventionNote = pgTable(
  "intervention_note",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    interventionId: uuid("intervention_id")
      .notNull()
      .references(() => intervention.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id),

    content: text("content").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_note_intervention").on(table.interventionId),
  ],
)
