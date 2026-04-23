import { z } from 'zod'

export const SubjectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  color: z
    .string()
    .trim()
    .min(3, 'Informe uma cor válida (ex.: oklch(...) ou #hex)'),
  textColor: z
    .string()
    .trim()
    .min(3, 'Informe a cor de texto/ícone (ex.: oklch(...) ou #hex)'),
  educationLevelSlugs: z
    .array(z.string().trim().min(1))
    .min(1, 'Selecione ao menos uma etapa'),
})

export type SubjectInput = z.infer<typeof SubjectSchema>
