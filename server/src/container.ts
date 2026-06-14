import type { IAuthProvider, IJobRepository, IUserRepository, IAuditRepository, IStorageProvider } from 'shared'
import type { DrizzleDB } from './db'

/**
 * Dependency Injection container.
 *
 * Wire adapters to services here. Change ONE line to switch implementations
 * (e.g. DrizzleJobRepository → PrismaJobRepository, BetterAuth → Clerk).
 */
export interface Container {
  db: DrizzleDB
  jobRepository: IJobRepository
  userRepository: IUserRepository
  authProvider: IAuthProvider
  auditRepository: IAuditRepository
  storageProvider: IStorageProvider
}

/**
 * Build the container with given dependencies.
 * In production, call this once at startup and pass the container to routes.
 */
export function buildContainer(deps: {
  db: DrizzleDB
  jobRepository: IJobRepository
  userRepository: IUserRepository
  authProvider: IAuthProvider
  auditRepository: IAuditRepository
  storageProvider: IStorageProvider
}): Container {
  return { ...deps }
}
