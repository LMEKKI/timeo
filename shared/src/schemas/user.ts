import { z } from 'zod'

export const UserRoleEnum = z.enum(['GLOBAL_ADMIN', 'BRANCH_MANAGER', 'FIELD_TECHNICIAN'])

export const UserProfileSchema = z.object({
  id: z.string(),
  authProviderId: z.string(),
  branchId: z.string(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  isDeleted: z.boolean().default(false),
})
export type UserProfileDTO = z.infer<typeof UserProfileSchema>

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a digit'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  branchId: z.string(),
  role: UserRoleEnum.default('FIELD_TECHNICIAN'),
})
export type CreateUserDTO = z.infer<typeof CreateUserSchema>

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type SignInDTO = z.infer<typeof SignInSchema>

export const PermissionSchema = z.object({
  id: z.string(),
  userProfileId: z.string(),
  role: UserRoleEnum,
})
export type PermissionDTO = z.infer<typeof PermissionSchema>
