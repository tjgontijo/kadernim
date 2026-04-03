import { searchUsersService } from '@/lib/users/services'
import { createAdminUserSearchHandler } from '../route-support'

export const GET = createAdminUserSearchHandler({
  searchUsers: searchUsersService,
})
