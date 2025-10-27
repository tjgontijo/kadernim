import { z } from 'zod'

// Schema para criar uma nova sugestão
export const CommunityResourceSuggestionCreateInput = z.object({
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim(),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim(),
  subjectId: z.string().cuid('ID da disciplina inválido'),
  educationLevelId: z.string().cuid('ID do nível de ensino inválido')
})

// Schema para editar uma sugestão
export const CommunityResourceSuggestionUpdateInput = z.object({
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  subjectId: z.string().cuid('ID da disciplina inválido').optional(),
  educationLevelId: z.string().cuid('ID do nível de ensino inválido').optional()
})

// Schema para filtros de listagem
export const CommunityResourceSuggestionFilters = z.object({
  status: z.enum(['SUGGESTED', 'IN_PRODUCTION', 'PUBLISHED']).optional(),
  subjectId: z.string().cuid().optional(),
  educationLevelId: z.string().cuid().optional(),
  authorId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sortBy: z.enum(['votes', 'created', 'updated']).default('votes'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// DTO para resposta da API
export interface CommunityResourceSuggestionDTO {
  id: string
  title: string
  description: string
  status: 'SUGGESTED' | 'IN_PRODUCTION' | 'PUBLISHED'
  voteCount: number
  hasUserVoted: boolean
  author: {
    id: string
    name: string
  }
  subject: {
    id: string
    name: string
  }
  educationLevel: {
    id: string
    name: string
  }
  productionCycle?: {
    id: string
    month: number
    year: number
  }
  resource?: {
    id: string
    title: string
    imageUrl: string
  }
  createdAt: string
  updatedAt: string
}

// DTO para resposta do Kanban
export interface KanbanBoardDTO {
  suggested: {
    items: CommunityResourceSuggestionDTO[]
    total: number
  }
  inProduction: {
    items: CommunityResourceSuggestionDTO[]
    total: number
  }
  published: {
    items: CommunityResourceSuggestionDTO[]
    total: number
  }
  metadata: {
    currentCycle: {
      id: string
      month: number
      year: number
      capacity: number
      remainingSlots: number
    } | null
    userStats: {
      totalSuggestions: number
      totalVotes: number
      suggestionsInProduction: number
      suggestionsPublished: number
    }
  }
}

export type CommunityResourceSuggestionCreateInputType = z.infer<typeof CommunityResourceSuggestionCreateInput>
export type CommunityResourceSuggestionUpdateInputType = z.infer<typeof CommunityResourceSuggestionUpdateInput>
export type CommunityResourceSuggestionFiltersType = z.infer<typeof CommunityResourceSuggestionFilters>