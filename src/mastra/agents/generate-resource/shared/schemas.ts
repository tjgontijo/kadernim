import { z } from 'zod'

export const ResourceProposalSchema = z.object({
  theme: z.string().max(100),
  summary: z.string().max(300),
  approach: z.string().max(100),
})

export const ResourceProposalsSchema = z.object({
  proposals: z.array(ResourceProposalSchema).length(3),
})

export type ResourceProposal = z.infer<typeof ResourceProposalSchema>
export type ResourceProposals = z.infer<typeof ResourceProposalsSchema>

export const SkillGenerationMapSchema = z.object({
  cognitiveVerb: z.string(),
  centralConcepts: z.array(z.string()),
  requiredRelations: z.array(z.string()),
  mustIncludeInStudentMaterial: z.array(z.string()),
  recommendedSituations: z.array(z.string()),
  misconceptionWarnings: z.array(z.string()),
  finalPerformanceTask: z.string(),
  assessmentEvidence: z.array(z.string()),
})

export type SkillGenerationMap = z.infer<typeof SkillGenerationMapSchema>

export const ResourceGenerationContextSchema = z.object({
  pedagogicalThesis: z.string().max(280),
  pageBlueprint: z.array(
    z.object({
      pageNumber: z.number().int().min(1),
      learningStep: z.enum([
        'contextualizacao',
        'conceituacao',
        'aplicacao',
        'historicidade',
        'producao_final',
      ]),
      purpose: z.string().max(220),
      mustInclude: z.array(z.string()).min(1).max(10),
      recommendedComponents: z.array(z.string().max(60)).min(1).max(14),
      targetQuestionCount: z.number().int().min(0).max(20),
    })
  ).min(2).max(12),
})

export const ResourceReviewIssueSchema = z.object({
  severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  category: z.enum(['PEDAGOGY', 'STRUCTURE', 'LANGUAGE', 'BNCC']),
  message: z.string().max(260),
})

export const ResourceGenerationReviewSchema = z.object({
  shouldRefine: z.boolean(),
  summary: z.string().max(400),
  issues: z.array(ResourceReviewIssueSchema).max(20),
})

export type ResourceGenerationContext = z.infer<typeof ResourceGenerationContextSchema>
export type ResourceGenerationReview = z.infer<typeof ResourceGenerationReviewSchema>
