import { listUsersService, createAdminUserService } from '@/lib/users/services'
import {
    createAdminUsersCollectionHandlers,
} from './route-support'

const handlers = createAdminUsersCollectionHandlers({
    listUsers: listUsersService,
    createUser: createAdminUserService,
})

export const { GET, POST } = handlers
