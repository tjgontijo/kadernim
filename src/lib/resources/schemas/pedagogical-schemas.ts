import { z } from 'zod';

export const PedagogicalObjectiveSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(10).max(500),
  order: z.number().int().positive(),
});

export const ResourceStepTypeEnum = z.enum([
  'WARMUP',
  'DISTRIBUTION',
  'PRACTICE',
  'CONCLUSION',
  'DISCUSSION',
  'ACTIVITY',
  'REFLECTION',
]);

export const PedagogicalStepSchema = z.object({
  id: z.string().uuid(),
  type: ResourceStepTypeEnum,
  title: z.string().min(5).max(100),
  duration: z.string().regex(/^\d+\s*(min|h)$/).optional(), // "15 min", "1 h"
  content: z.string().min(20).max(2000),
  order: z.number().int().positive(),
});

export const PedagogicalMaterialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(5).max(200),
  quantity: z.number().int().positive(),
});

export const PedagogicalContentSchema = z.object({
  objectives: z.array(PedagogicalObjectiveSchema).min(1).max(10),
  steps: z.array(PedagogicalStepSchema).min(1).max(10),
  materials: z.array(PedagogicalMaterialSchema).optional(),
});

export type PedagogicalContent = z.infer<typeof PedagogicalContentSchema>;

/**
 * Validates pedagogical content against the schema
 */
export function validatePedagogicalContent(data: unknown) {
  return PedagogicalContentSchema.safeParse(data);
}
