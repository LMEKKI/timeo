import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "../helpers";
import { addresses } from "./addresses";

export const clients = pgTable(
	"clients",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		addressId: uuid("address_id").references(() => addresses.id, {
			onDelete: "set null",
		}),
		phone: text("phone"),
		email: text("email"),
		notes: text("notes"),
		...auditFields,
	},
	(table) => [index("idx_clients_name").on(table.name)],
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
