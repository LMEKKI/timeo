import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "../helpers";
import { clients } from "./clients";

export const interlocuteurs = pgTable(
	"interlocuteurs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		clientId: uuid("client_id")
			.notNull()
			.references(() => clients.id, { onDelete: "cascade" }),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		role: text("role"),
		email: text("email"),
		phone: text("phone"),
		isPrimary: boolean("is_primary").notNull().default(false),
		notes: text("notes"),
		...auditFields,
	},
	(table) => [index("idx_interlocuteurs_client").on(table.clientId)],
);

export type Interlocuteur = typeof interlocuteurs.$inferSelect;
export type NewInterlocuteur = typeof interlocuteurs.$inferInsert;
