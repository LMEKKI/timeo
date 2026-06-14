import { z } from 'zod'
import type { Company, Branch } from '../types'

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255),
  createdAt: z.date(),
})
export type CompanyDTO = z.infer<typeof CompanySchema>

export const BranchSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string().min(1).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  createdAt: z.date(),
})
export type BranchDTO = z.infer<typeof BranchSchema>

export const CreateBranchSchema = BranchSchema.omit({ id: true, createdAt: true })
export type CreateBranchDTO = z.infer<typeof CreateBranchSchema>
