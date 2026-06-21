import { pgEnum } from "drizzle-orm/pg-core";

/**
 * User role within Timeo.
 * - `chef`: Manager / dispatcher — plans and supervises interventions
 * - `tech`: Field technician — executes interventions on site
 */
export const userRoleEnum = pgEnum("user_role", ["chef", "tech"]);

/**
 * Technician availability status.
 * - `disponible`: Available for new assignments
 * - `indisponible`: Off duty, sick, or otherwise unavailable
 * - `en_intervention`: Currently assigned to an intervention
 */
export const disponibiliteEnum = pgEnum("disponibilite", [
  "disponible",
  "indisponible",
  "en_intervention",
]);

/**
 * Client origin source.
 * - `interne`: Created manually within Timeo
 * - `crm`: Imported from an external CRM system
 */
export const clientSourceEnum = pgEnum("client_source", ["interne", "crm"]);

/**
 * Intervention priority level.
 * - `basse`: Low priority — routine maintenance
 * - `normale`: Normal priority — standard intervention
 * - `haute`: High priority — needs prompt attention
 * - `urgente`: Emergency — immediate response required
 */
export const prioriteEnum = pgEnum("priorite", [
  "basse",
  "normale",
  "haute",
  "urgente",
]);

/**
 * Intervention lifecycle status.
 * - `non_planifiee`: Created but not yet scheduled
 * - `planifiee`: Scheduled with date/time assigned
 * - `en_route`: Technician is traveling to site
 * - `en_cours`: Work is in progress on site
 * - `terminee`: Work completed successfully
 * - `annulee`: Intervention cancelled
 */
export const statutInterventionEnum = pgEnum("statut_intervention", [
  "non_planifiee",
  "planifiee",
  "en_route",
  "en_cours",
  "terminee",
  "annulee",
]);
