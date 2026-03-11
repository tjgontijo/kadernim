import { searchUsersService } from '@/services/users/search-users'
import { createAdminUserSearchHandler } from '../route-support'

export const GET = createAdminUserSearchHandler({
  searchUsers: searchUsersService,
})
