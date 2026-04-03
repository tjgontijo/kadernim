import type { CommunityFilters, CommunityRequestInput } from '@/lib/community/schemas'

export interface CommunityConfig {
  requests: {
    limit: number
  }
  uploads: {
    maxFiles: number
    maxSizeMB: number
  }
}

export interface CommunityUsage {
  used: number
  limit: number
  remaining: number
  resetsAt: string
  yearMonth: string
  type: 'requests'
}

export interface CommunityAttachmentUpload {
  cloudinaryPublicId: string
  url: string
  fileName: string
  fileType: string
  fileSize: number
}

export interface CommunityRequestAuthor {
  name: string | null
  image: string | null
}

export interface CommunityTaxonomySummary {
  name: string
}

export interface CommunityRequestItem {
  id: string
  title: string
  description: string
  voteCount: number
  hasVoted: boolean
  hasBnccAlignment: boolean
  bnccSkillCodes: string[]
  createdAt: string
  user: CommunityRequestAuthor
  educationLevel: CommunityTaxonomySummary | null
  subject: CommunityTaxonomySummary | null
  grade: CommunityTaxonomySummary | null
}

export interface CommunityRequestListResponse {
  items: CommunityRequestItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CommunityTitleOption {
  type: 'short' | 'descriptive' | 'creative'
  label: string
  text: string
}

export interface CommunityRefinementOption {
  type: 'format' | 'usability' | 'pedagogy'
  label: string
  text: string
}

export type CommunityListFilters = CommunityFilters & {
  currentUserId?: string
  mine?: boolean
}

export type CreateCommunityRequestInput = CommunityRequestInput & {
  attachments?: File[]
}
