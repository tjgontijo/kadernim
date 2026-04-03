import type {
  CreateLessonPlan,
  FullLessonPlanContent,
  LessonPlanContent,
  LessonPlanResponse,
  RefineThemeRequest,
  RefinedThemes,
} from '@/lib/lesson-plans/schemas'

export type {
  CreateLessonPlan,
  FullLessonPlanContent,
  LessonPlanContent,
  LessonPlanResponse,
  RefineThemeRequest,
  RefinedThemes,
}

export interface BnccSkillDescription {
  code: string
  description: string
}

export interface LessonPlanDetail extends LessonPlanResponse {
  bnccSkillDescriptions: BnccSkillDescription[]
}

export interface LessonPlanUsage {
  used: number
  limit: number
  remaining: number
  resetsAt: string
  yearMonth: string
  percentage: number
}

export interface GenerateLessonPlanThemeInput {
  educationLevelSlug?: string
  gradeSlug?: string
  subjectSlug?: string
  mainSkillCode: string
  mainSkillDescription: string
  intentRaw?: string
}

export interface GenerateLessonPlanThemeResponse {
  theme: string
}

export interface RefinedThemeOption {
  version: 'short' | 'medium' | 'long'
  text: string
}

export interface RefineLessonPlanThemeResponse {
  original: string
  refined: RefinedThemeOption[]
}

export interface CreateLessonPlanSuccess extends LessonPlanResponse {
  downloadUrls: {
    docx: string
    pdf: string
  }
}

