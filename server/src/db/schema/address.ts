import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Physical address.
 *
 * Designed as a shared reference table so both `clients` and `interventions`
 * can point to the same address. When a client moves, a new address row is
 * added (no in-place update) so historical intervention records keep pointing
 * to the correct address at the time of service.
 */
export const address = pgTable("address", {
  id: uuid("id").primaryKey().defaultRandom(),

  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),

  /** Latitude with 7 decimal places (~11 mm precision) */
  lat: numeric("lat", { precision: 10, scale: 7 }),
  /** Longitude with 7 decimal places */
  lng: numeric("lng", { precision: 10, scale: 7 }),

  /** Optional: floor, building, apartment, etc. */
  complement: text("complement"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
