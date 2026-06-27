import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "../helpers";

export const addresses = pgTable(
	"addresses",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		label: text("label"),
		line1: text("line1").notNull(),
		line2: text("line2"),
		postalCode: text("postal_code").notNull(),
		city: text("city").notNull(),
		country: text("country").notNull().default("FR"),
		latitude: text("latitude"),
		longitude: text("longitude"),
		...auditFields,
	},
	(table) => [index("idx_addresses_city").on(table.city)],
);

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
