import { getUserByIdService, updateUserService, deleteUserService } from '@/lib/users/services'
import {
    createAdminUserCrudHandlers,
} from '../route-support'

const handlers = createAdminUserCrudHandlers({
    getUser: getUserByIdService,
    updateUser: updateUserService,
    deleteUser: deleteUserService,
})

export const { GET, PATCH, DELETE } = handlers
