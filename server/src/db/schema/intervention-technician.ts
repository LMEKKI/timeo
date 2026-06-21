import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core"
import { user } from "./better-auth"
import { intervention } from "./intervention"

/**
 * Junction table: Intervention ↔ Technician (many-to-many).
 *
 * Composite PK prevents duplicate assignments.
 */
export const interventionTechnician = pgTable(
  "intervention_technician",
  {
    interventionId: uuid("intervention_id")
      .notNull()
      .references(() => intervention.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.interventionId, table.userId] }),
  }),
)
