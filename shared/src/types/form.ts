export interface FormTemplate {
  id: string
  jobTypeId: string
  version: number
  title: string
  questionSchema: Record<string, unknown> // JSONB Zod schema
  isActive: boolean
}

export interface WorkflowConfig {
  id: string
  jobTypeId: string
  engineType: string
  approvalRequired: boolean
}
