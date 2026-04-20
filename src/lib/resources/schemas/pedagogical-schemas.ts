import { z } from 'zod';

export const PedagogicalObjectiveSchema = z.object({
  id: z.string().uuid().optional(),
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
  id: z.string().uuid().optional(),
  type: ResourceStepTypeEnum,
  title: z.string().min(5).max(100),
  duration: z.string().regex(/^\d+\s*(min|h)$/).optional(), // "15 min", "1 h"
  content: z.string().min(20).max(2000),
  order: z.number().int().positive(),
});

export const PedagogicalObjectivesSchema = z.array(PedagogicalObjectiveSchema).min(1).max(10);
export const PedagogicalStepsSchema = z.array(PedagogicalStepSchema).min(1).max(10);

export const PedagogicalContentSchema = z.object({
  objectives: PedagogicalObjectivesSchema,
  steps: PedagogicalStepsSchema,
});

export type PedagogicalContent = z.infer<typeof PedagogicalContentSchema>;

export const PedagogicalContentUpdateSchema = z
  .object({
    objectives: PedagogicalObjectivesSchema.optional(),
    steps: PedagogicalStepsSchema.optional(),
  })
  .refine(
    (value) =>
      value.objectives !== undefined ||
      value.steps !== undefined,
    { message: 'At least one section must be provided' }
  );

export type PedagogicalContentUpdate = z.infer<typeof PedagogicalContentUpdateSchema>;

/**
 * Validates pedagogical content against the schema
 */
export function validatePedagogicalContent(data: unknown) {
  return PedagogicalContentSchema.safeParse(data);
}

export function validatePedagogicalContentUpdate(data: unknown) {
  return PedagogicalContentUpdateSchema.safeParse(data);
}
