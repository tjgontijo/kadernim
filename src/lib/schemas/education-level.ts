// src/lib/schemas/education-level.ts
import { z } from 'zod'

export const EducationLevelDTO = z.object({
  id: z.string(),
  name: z.string(),
  ageRange: z.string().nullable().optional()
})
export type EducationLevelDTO = z.infer<typeof EducationLevelDTO>

export const EducationLevelCreateInput = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  ageRange: z.string().nullable().optional()
})

export const EducationLevelUpdateInput = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  ageRange: z.string().nullable().optional()
})
