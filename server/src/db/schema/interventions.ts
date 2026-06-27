import { date, index, pgEnum, pgTable, text, time, uuid } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { clients } from "./clients";
import { interlocuteurs } from "./interlocuteurs";
import { auditFields } from "../helpers";

export const statusEnum = pgEnum("intervention_status", [
	"unassigned",
	"planned",
	"started",
	"completed",
	"cancelled",
]);

export const priorityEnum = pgEnum("intervention_priority", ["low", "high", "urgent"]);

export const interventions = pgTable(
	"interventions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		clientId: uuid("client_id")
			.notNull()
			.references(() => clients.id, { onDelete: "restrict" }),
		interlocuteurId: uuid("interlocuteur_id").references(() => interlocuteurs.id, {
			onDelete: "set null",
		}),
		addressId: uuid("address_id").references(() => addresses.id, { onDelete: "set null" }),
		date: date("date").notNull(),
		startTime: time("start_time").notNull(),
		status: statusEnum("status").notNull().default("unassigned"),
		priority: priorityEnum("priority"),
		chefNote: text("chef_note"),
		...auditFields,
	},
	(table) => [
		index("idx_interventions_status_date").on(table.status, table.date),
		index("idx_interventions_client").on(table.clientId),
		index("idx_interventions_date").on(table.date),
	],
);

export type Intervention = typeof interventions.$inferSelect;
export type NewIntervention = typeof interventions.$inferInsert;
