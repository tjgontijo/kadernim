import { z } from 'zod';

export const PedagogicalEnrichmentSchema = z.object({
  description: z.string(),
  objectives: z.array(z.string()),
  bnccCodes: z.array(z.string()).max(3),
  grades: z.array(z.string()),
  steps: z.array(z.object({
    type: z.enum(['WARMUP', 'DISTRIBUTION', 'CONCLUSION']),
    title: z.string(),
    duration: z.string(),
    content: z.string()
  }))
});

export const ResourceReviewBatchSchema = z.object({
  reviews: z.array(z.object({
    rating: z.number().min(1).max(5),
    comment: z.string()
  })).min(5).max(9)
});
