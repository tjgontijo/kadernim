import { listUsersService } from '@/services/users/list-users'
import { createAdminUserService } from '@/services/users/update-user'
import {
    createAdminUsersCollectionHandlers,
} from './route-support'

const handlers = createAdminUsersCollectionHandlers({
    listUsers: listUsersService,
    createUser: createAdminUserService,
})

export const { GET, POST } = handlers
