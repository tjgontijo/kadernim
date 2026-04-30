import { z } from 'zod'

/* ============================================================
   BNCC STRUCTURES
   ============================================================ */

export const KnowledgeAreaSchema = z.enum([
  'linguagens',
  'matematica',
  'ciencias_natureza',
  'ciencias_humanas',
  'ensino_religioso',
])
export type KnowledgeArea = z.infer<typeof KnowledgeAreaSchema>

export const SubjectComponentSchema = z.enum([
  'lingua_portuguesa',
  'arte',
  'educacao_fisica',
  'lingua_inglesa',
  'matematica',
  'ciencias',
  'historia',
  'geografia',
  'ensino_religioso',
])
export type SubjectComponent = z.infer<typeof SubjectComponentSchema>

export const BnccSkillSchema = z.object({
  code: z.string().regex(/^EF\d{2}[A-Z]{2}\d{2}$/),
  year: z.number().int().min(1).max(9),
  component: SubjectComponentSchema,
  area: KnowledgeAreaSchema,
  description: z.string().max(500),
})
export type BnccSkill = z.infer<typeof BnccSkillSchema>

/* ============================================================
   PEDAGOGICAL PHASES
   ============================================================ */

export const PedagogicalPhaseSchema = z.enum(['phase_1', 'phase_2', 'phase_3', 'phase_4', 'phase_5'])
export type PedagogicalPhase = z.infer<typeof PedagogicalPhaseSchema>

/* ============================================================
   LAYOUT STRUCTURES
   ============================================================ */

export const GridPositionSchema = z.object({
  col: z.number().int().min(1).max(12),
  row: z.number().int().min(1).max(18),
  colSpan: z.number().int().min(1).max(12),
  rowSpan: z.number().int().min(1),
})
export type GridPosition = z.infer<typeof GridPositionSchema>

/* ============================================================
   COMPONENT TYPES
   ============================================================ */

// Structural components
export const PageHeaderSchema = z.object({
  id: z.string(),
  type: z.literal('page_header'),
  title: z.string().max(200),
  subject: z.string(),
  year: z.string(),
  bnccCode: z.string(),
  teacherField: z.boolean().optional(),
  studentField: z.boolean().optional(),
  dateField: z.boolean().optional(),
  schoolField: z.boolean().optional(),
})

export const PageFooterSchema = z.object({
  id: z.string(),
  type: z.literal('page_footer'),
  bnccSkill: z.string(),
  competencyArea: z.string(),
  pageNumber: z.number().int(),
})

// Content blocks
export const StoryBlockSchema = z.object({
  id: z.string(),
  type: z.literal('story_block'),
  storyText: z.string().max(600),
  imagePlaceholder: z.string().optional(),
  learningPoint: z.string().max(200),
})

export const ConceptBoxSchema = z.object({
  id: z.string(),
  type: z.literal('concept_box'),
  term: z.string().max(60),
  definition: z.string().max(300),
})

export const TipBoxSchema = z.object({
  id: z.string(),
  type: z.literal('tip_box'),
  tipText: z.string().max(200),
})

export const VocabularyBoxSchema = z.object({
  id: z.string(),
  type: z.literal('vocabulary_box'),
  items: z.array(
    z.object({
      term: z.string().max(60),
      definition: z.string().max(80),
    })
  ).min(1).max(5),
})

export const ActivityIntroSchema = z.object({
  id: z.string(),
  type: z.literal('activity_intro'),
  instructionText: z.string().max(600),
  bodyText: z.string().max(1200),
  source: z.string().optional(),
})

export const ProseBlockSchema = z.object({
  id: z.string(),
  type: z.literal('prose_block'),
  paragraphs: z.array(z.string().max(1200)).min(1).max(8),
})

export const CalloutVariantSchema = z.enum([
  'think',
  'didyouknow',
  'attention',
  'tip',
  'quick',
  'pause',
])

export const CalloutBoxSchema = z.object({
  id: z.string(),
  type: z.literal('callout_box'),
  variant: CalloutVariantSchema,
  body: z.string().max(800),
  title: z.string().max(80).optional(),
  icon: z.string().max(8).optional(),
})

export const ConnectionWebSchema = z.object({
  id: z.string(),
  type: z.literal('connection_web'),
  center: z.string().max(120),
  connections: z.array(
    z.object({
      item: z.string().max(80),
      label: z.string().max(80),
    })
  ).min(3).max(6),
})

export const ReadingBoxSchema = z.object({
  id: z.string(),
  type: z.literal('reading_box'),
  tag: z.string().max(30).optional(),
  title: z.string().max(220),
  body: z.string().max(2500),
  source: z.string().max(220).optional(),
})

export const DialogueBoxSchema = z.object({
  id: z.string(),
  type: z.literal('dialogue_box'),
  title: z.string().max(60).optional(),
  lines: z.array(
    z.object({
      speaker: z.string().max(40),
      text: z.string().max(350),
      side: z.enum(['left', 'right']).optional(),
    })
  ).min(2).max(8),
})

// Question types
export const MultipleChoiceQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('multiple_choice'),
  number: z.number().int().min(1),
  prompt: z.string().max(400),
  options: z.array(z.string().max(120)).min(4).max(4),
  assessmentTarget: z.string().max(200),
})

export const OpenShortQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('open_short'),
  number: z.number().int().min(1),
  prompt: z.string().max(400),
  lines: z.number().int().min(2).max(4),
  assessmentTarget: z.string().max(200),
})

export const OpenLongQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('open_long'),
  number: z.number().int().min(1),
  prompt: z.string().max(400),
  lines: z.number().int().min(4).max(8),
  assessmentTarget: z.string().max(200),
})

export const TrueFalseQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('true_false'),
  number: z.number().int().min(1),
  prompt: z.string().max(200),
  statements: z.array(z.string().max(150)).min(3).max(8),
  assessmentTarget: z.string().max(200),
})

export const FillBlankQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('fill_blank'),
  number: z.number().int().min(1),
  prompt: z.string().max(200),
  wordBank: z.array(z.string().max(40)).min(3).max(8).optional(),
  sentenceTemplate: z.string().max(600),
  assessmentTarget: z.string().max(200),
})

export const MatchingQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('matching'),
  number: z.number().int().min(1),
  prompt: z.string().max(200),
  leftItems: z.array(z.string().max(40)).min(3).max(5),
  rightItems: z.array(z.string().max(60)).min(3).max(5),
  assessmentTarget: z.string().max(200),
})

export const OrderingQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('ordering'),
  number: z.number().int().min(1),
  prompt: z.string().max(200),
  items: z.array(z.string().max(120)).min(3).max(8),
  assessmentTarget: z.string().max(200),
})

export const CalculationQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('calculation'),
  number: z.number().int().min(1),
  prompt: z.string().max(300),
  expression: z.string().max(200).optional(),
  developmentLines: z.number().int().min(4).max(10),
  hasAnswerLine: z.boolean().optional(),
  assessmentTarget: z.string().max(200),
})

export const ComprehensionQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('comprehension'),
  number: z.number().int().min(1),
  prompt: z.string().max(400),
  lines: z.number().int().min(3).max(6),
  assessmentTarget: z.string().max(200),
})

export const ReasoningQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('reasoning'),
  number: z.number().int().min(1),
  prompt: z.string().max(400),
  lines: z.number().int().min(3).max(6),
  assessmentTarget: z.string().max(200),
})

export const CreationQuestionSchema = z.object({
  id: z.string(),
  type: z.literal('creation'),
  number: z.number().int().min(1),
  prompt: z.string().max(400),
  lines: z.number().int().min(2).max(6),
  assessmentTarget: z.string().max(200),
})

export const SelfAssessmentSchema = z.object({
  id: z.string(),
  type: z.literal('self_assessment'),
  title: z.string().max(80).optional(),
  items: z.array(z.string().max(120)).min(2).max(6),
})

// Enrichment
export const TimelineSchema = z.object({
  id: z.string(),
  type: z.literal('timeline'),
  events: z.array(
    z.object({
      date: z.string().max(50),
      label: z.string().max(30),
    })
  ).min(3).max(7),
})

export const DataTableSchema = z.object({
  id: z.string(),
  type: z.literal('data_table'),
  headers: z.array(z.string().max(30)).min(2).max(5),
  rows: z.array(z.array(z.string().max(40))).min(1).max(8),
})

export const ImagePlaceholderSchema = z.object({
  id: z.string(),
  type: z.literal('image_placeholder'),
  caption: z.string().max(80),
  description: z.string().max(120),
})

export const ChallengeBoxSchema = z.object({
  id: z.string(),
  type: z.literal('challenge_box'),
  challengeText: z.string().max(400),
  lines: z.number().int().min(2).max(6),
})

export const GraphPlaceholderSchema = z.object({
  id: z.string(),
  type: z.literal('graph_placeholder'),
  caption: z.string().max(100),
  description: z.string().max(180),
  icon: z.string().max(8).optional(),
  showAxes: z.boolean().optional(),
})

export const DrawingAreaSchema = z.object({
  id: z.string(),
  type: z.literal('drawing_area'),
  prompt: z.string().max(400),
  number: z.number().int().min(1).optional(),
  label: z.string().max(80).optional(),
})

export const FrameBoxSchema = z.object({
  id: z.string(),
  type: z.literal('frame_box'),
  title: z.string().max(120).optional(),
  body: z.string().max(800),
  lines: z.number().int().min(1).max(6).optional(),
})

export const DividerSectionSchema = z.object({
  id: z.string(),
  type: z.literal('divider_section'),
  sectionTitle: z.string().max(50),
})

// Union of all components
export const ComponentSchema = z.union([
  PageHeaderSchema,
  PageFooterSchema,
  StoryBlockSchema,
  ConceptBoxSchema,
  TipBoxSchema,
  VocabularyBoxSchema,
  ActivityIntroSchema,
  ProseBlockSchema,
  CalloutBoxSchema,
  ConnectionWebSchema,
  ReadingBoxSchema,
  DialogueBoxSchema,
  MultipleChoiceQuestionSchema,
  OpenShortQuestionSchema,
  OpenLongQuestionSchema,
  TrueFalseQuestionSchema,
  FillBlankQuestionSchema,
  MatchingQuestionSchema,
  OrderingQuestionSchema,
  CalculationQuestionSchema,
  ComprehensionQuestionSchema,
  ReasoningQuestionSchema,
  CreationQuestionSchema,
  TimelineSchema,
  DataTableSchema,
  ImagePlaceholderSchema,
  ChallengeBoxSchema,
  GraphPlaceholderSchema,
  DrawingAreaSchema,
  FrameBoxSchema,
  DividerSectionSchema,
  SelfAssessmentSchema,
])

/* ============================================================
   PAGE & RESOURCE PLANS
   ============================================================ */

export const PagePlanSchema = z.object({
  pageNumber: z.number().int().min(1),
  components: z.array(ComponentSchema).min(1),
})

export const ResourcePlanSchema = z.object({
  title: z.string().max(200),
  skill: BnccSkillSchema,
  pages: z.array(PagePlanSchema).min(1),
  teacherGuide: z.object({
    answerKey: z.array(
      z.object({
        questionNumber: z.number().int(),
        expectedAnswer: z.string().max(1000),
        acceptableVariations: z.array(z.string()).optional(),
      })
    ),
    assessmentNotes: z.array(z.string()),
  }),
})

// Backward-compatible alias (legacy name)
export const ApostilaPlanSchema = ResourcePlanSchema

export type ResourcePlan = z.infer<typeof ResourcePlanSchema>
export type ApostilaPlan = ResourcePlan
export type PagePlan = z.infer<typeof PagePlanSchema>
export type Component = z.infer<typeof ComponentSchema>

/* ============================================================
   USER INPUT
   ============================================================ */

export const ActivityInputSchema = z.object({
  bnccCode: z.string().regex(/^EF\d{2}[A-Z]{2}\d{2}$/),
  questionCount: z.number().int().min(1).max(20).optional(),
})

export type ActivityInput = z.infer<typeof ActivityInputSchema>

/* ============================================================
   API RESPONSE
   ============================================================ */

export const GenerateResourceResponseSchema = z.object({
  success: z.boolean(),
  plan: ResourcePlanSchema.optional(),
  previewHtml: z.string().optional(),
  error: z.string().optional(),
})

// Backward-compatible alias (legacy name)
export const GenerateApostilaResponseSchema = GenerateResourceResponseSchema

export type GenerateResourceResponse = z.infer<typeof GenerateResourceResponseSchema>
export type GenerateApostilaResponse = GenerateResourceResponse

/* ============================================================
   UTILITIES
   ============================================================ */

export const QUESTION_COMPONENT_TYPES = new Set<Component['type']>([
  'multiple_choice',
  'open_short',
  'open_long',
  'true_false',
  'fill_blank',
  'matching',
  'ordering',
  'calculation',
  'comprehension',
  'reasoning',
  'creation',
])

export function isQuestion(component: Component): boolean {
  return QUESTION_COMPONENT_TYPES.has(component.type)
}

export function countQuestions(plan: ResourcePlan): number {
  return plan.pages.reduce(
    (total, page) => total + page.components.filter(isQuestion).length,
    0
  )
}
