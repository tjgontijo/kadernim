import type {
  CreateResourceInput,
  ListResourcesFilter,
  ResourceDetailResponse,
  UpdateResourceImageInput,
  UpdateResourceInput,
  UpdateResourceVideoInput,
} from '@/lib/resources/schemas/admin-resource-schemas'
import type {
  Resource,
  ResourceDetail,
  ResourceFilter,
  ResourceImage,
  ResourceVideo,
} from '@/lib/resources/schemas/resource-schemas'
import type { AdminResourceListResponse } from '@/lib/resources/schemas'

export type {
  CreateResourceInput,
  ListResourcesFilter,
  Resource,
  ResourceDetail,
  ResourceDetailResponse as AdminResourceDetail,
  ResourceFilter,
  ResourceImage,
  AdminResourceListResponse,
  ResourceVideo,
  UpdateResourceImageInput,
  UpdateResourceInput,
  UpdateResourceVideoInput,
}

export interface ResourceMetaItem {
  key: string
  label: string
}

export interface ResourceGradeMetaItem extends ResourceMetaItem {
  educationLevelKey: string
  subjects: string[]
}

export interface ResourceMetaResponse {
  educationLevels: ResourceMetaItem[]
  subjects: ResourceMetaItem[]
  grades: ResourceGradeMetaItem[]
  user: {
    role: string | null
    isAdmin: boolean
    isSubscriber: boolean
  }
}

export interface ResourcesSummaryResponse {
  items: Resource[]
  pagination: {
    page: number
    limit: number
    hasMore: boolean
  }
  counts: {
    all: number
    mine: number
    free: number
  }
  meta: {
    educationLevels: ResourceMetaItem[]
    subjects: ResourceMetaItem[]
    user: {
      role: string | null
      isAdmin: boolean
      isSubscriber: boolean
    }
  }
}

export interface ResourceDownloadLinkResponse {
  data: {
    id: string
    name: string
    downloadUrl?: string
  }
  meta: {
    expiresAt: string
  }
}

export interface ResourceAccessRecord {
  id: string
  userId: string
  resourceId: string
  user: {
    id: string
    name: string
    email: string
  }
  source: string | null
  grantedAt: string
  expiresAt: string | null
}

export interface ResourceAccessListResponse {
  accessList: ResourceAccessRecord[]
}

export interface ResourceAccessGrantInput {
  userId: string
  expiresAt?: Date | null
}
