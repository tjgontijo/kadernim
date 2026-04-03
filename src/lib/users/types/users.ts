import type {
  CreateAdminUserInput,
  ListUsersFilter,
  ToggleUserAccessInput,
  UpdateUserInput,
  UserListResponse,
} from '@/lib/users/schemas'

export type {
  CreateAdminUserInput,
  ListUsersFilter,
  ToggleUserAccessInput,
  UpdateUserInput,
  UserListResponse,
}

export interface UserSearchResult {
  id: string
  name: string
  email: string
}

export interface UserSearchResponse {
  users: UserSearchResult[]
}

export interface UserResourceAccessItem {
  id: string
  title: string
  isFree: boolean
  educationLevel: string
  subject: string
  hasAccess: boolean
}
