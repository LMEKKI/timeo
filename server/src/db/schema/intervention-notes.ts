import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { interventions } from "./interventions";

export const interventionNotes = pgTable(
	"intervention_notes",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		interventionId: uuid("intervention_id")
			.notNull()
			.references(() => interventions.id, { onDelete: "cascade" }),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		content: text("content").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("idx_intervention_notes_intervention").on(table.interventionId, table.createdAt)],
);

export type InterventionNote = typeof interventionNotes.$inferSelect;
export type NewInterventionNote = typeof interventionNotes.$inferInsert;
