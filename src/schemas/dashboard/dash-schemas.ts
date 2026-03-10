import { z } from 'zod'

export const dashPageShellPropsSchema = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    padded: z.boolean().optional(),
})
