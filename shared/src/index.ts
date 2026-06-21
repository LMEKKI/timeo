// ─── Schemas ──────────────────────────────────────────────────────────────────
// Shared Zod schemas used by both server (validation) and client (forms + RPC types).
export {
  interventionStatusEnum,
  prioriteEnum,
  TRANSITION_MAP,
  canTransition,
  createInterventionSchema,
  updateInterventionSchema,
  interventionFiltersSchema,
  transitionSchema,
  assignSchema,
  createNoteSchema,
} from "./schemas/intervention"

export type {
  InterventionStatus,
  Priorite,
  AllowedTransition,
  CreateIntervention,
  UpdateIntervention,
  InterventionFilters,
  TransitionInput,
  AssignInput,
  CreateNote,
} from "./schemas/intervention"

export {
  clientSourceEnum,
  addressSchema,
  createClientSchema,
  updateClientSchema,
  clientFiltersSchema,
  createInterlocuteurSchema,
  updateInterlocuteurSchema,
} from "./schemas/client"

export type {
  ClientSource,
  AddressInput,
  CreateClient,
  UpdateClient,
  ClientFilters,
  CreateInterlocuteur,
  UpdateInterlocuteur,
} from "./schemas/client"

export {
  userRoleEnum,
  disponibiliteEnum,
  createUserSchema,
  updateUserSchema,
  updateDisponibiliteSchema,
  userFiltersSchema,
} from "./schemas/user"

export type {
  UserRole,
  Disponibilite,
  CreateUser,
  UpdateUser,
  UpdateDisponibilite,
  UserFilters,
} from "./schemas/user"

export {
  uuidSchema,
  paginationSchema,
  searchSchema,
  dateStringSchema,
  timeStringSchema,
} from "./schemas/common"

// ─── Shared Constants ─────────────────────────────────────────────────────────

export const MAX_TECHS_PER_INTERVENTION = 5
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
