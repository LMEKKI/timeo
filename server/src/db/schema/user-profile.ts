import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { disponibiliteEnum, userRoleEnum } from "./enums";

/**
 * Extended profile for each Better Auth user.
 *
 * 1:1 with `user` — the PK is also the FK, enforcing the constraint at the
 * database level. Every user in the system must have exactly one profile row
 * (created during sign-up via a trigger or app logic).
 */
export const userProfile = pgTable(
  "user_profile",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),

    /** Role within Timeo: chef (manager) or tech (field technician) */
    role: userRoleEnum("role").notNull().default("tech"),

    /**
     * Forces the user to set a new password on next login.
     * Defaults to `true` so newly created accounts require a password change.
     */
    forcePasswordChange: boolean("force_password_change").notNull().default(true),

    /** Current availability status for dispatching */
    disponibilite: disponibiliteEnum("disponibilite")
      .notNull()
      .default("disponible"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_profile_role_idx").on(table.role),
    index("user_profile_disponibilite_idx").on(table.disponibilite),
  ],
);
