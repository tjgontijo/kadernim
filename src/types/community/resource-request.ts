export type ResourceRequestStatus = 'SUBMITTED' | 'IN_PRODUCTION' | 'PUBLISHED'

export interface ResourceRequestWithRelations {
  id: string
  title: string
  description: string
  status: ResourceRequestStatus
  userId: string
  educationLevelId: string
  subjectId: string
  voteCount: number
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    image: string | null
  }
  educationLevel: {
    id: string
    name: string
  }
  subject: {
    id: string
    name: string
  }
  votes?: {
    id: string
    userId: string
    createdAt: Date
  }[]
  hasUserVoted?: boolean
  isCreator?: boolean
}

export interface ResourceRequestFilters {
  status?: ResourceRequestStatus
  educationLevelId?: string
  subjectId?: string
  myRequests?: boolean
}

export interface ResourceRequestFormData {
  title: string
  description: string
  educationLevelId: string
  subjectId: string
}
