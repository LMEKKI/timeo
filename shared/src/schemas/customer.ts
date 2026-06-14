import { z } from 'zod'

export const CustomerSchema = z.object({
  id: z.string(),
  branchId: z.string(),
  name: z.string().min(1).max(255),
  billingAddress: z.string().min(1),
  isDeleted: z.boolean().default(false),
})
export type CustomerDTO = z.infer<typeof CustomerSchema>

export const CreateCustomerSchema = CustomerSchema.omit({ id: true, isDeleted: true })
export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>
