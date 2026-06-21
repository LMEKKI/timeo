import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { address } from "./address";
import { clientSourceEnum } from "./enums";

/**
 * Client (customer) of the field service operation.
 *
 * Supports soft-delete via `deletedAt`. Queries should filter
 * `isNull(client.deletedAt)` unless explicitly including archived records.
 */
export const client = pgTable(
  "client",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),

    /** Primary billing/contact address */
    addressId: uuid("address_id").references(() => address.id),

    phone: text("phone"),
    email: text("email"),
    notes: text("notes"),

    /** Origin of the client record */
    source: clientSourceEnum("source").notNull().default("interne"),

    /**
     * External CRM identifier for future integration.
     * Null until CRM sync is implemented.
     */
    crmId: text("crm_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("client_address_id_idx").on(table.addressId),
    index("client_deleted_at_idx").on(table.deletedAt),
  ],
);

/**
 * Contact person(s) for a client.
 *
 * A client may have multiple contacts (e.g., site manager, billing contact).
 * Cascades on client deletion.
 */
export const interlocuteur = pgTable(
  "interlocuteur",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    clientId: uuid("client_id")
      .notNull()
      .references(() => client.id, { onDelete: "cascade" }),

    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone"),
    email: text("email"),

    /** Job title or function (e.g., "Responsable technique", "Directeur") */
    role: text("role"),

    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("interlocuteur_client_id_idx").on(table.clientId)],
);
