import {
	index,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { interventions } from "./interventions";
import { auditFields } from "../helpers";

export const teamRoleEnum = pgEnum("intervention_team_role", ["lead", "assistant"]);

export const interventionTechnicien = pgTable(
	"intervention_technicien",
	{
		interventionId: uuid("intervention_id")
			.notNull()
			.references(() => interventions.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		teamRole: teamRoleEnum("team_role").notNull().default("assistant"),
		assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
		...auditFields,
	},
	(table) => [
		primaryKey({ columns: [table.interventionId, table.userId] }),
		index("idx_intervention_technicien_user").on(table.userId),
	],
);

export type InterventionTechnicien = typeof interventionTechnicien.$inferSelect;
export type NewInterventionTechnicien = typeof interventionTechnicien.$inferInsert;
