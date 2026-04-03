import { updateUserService, deleteUserService } from '@/lib/users/services'
import {
    createAdminUserCrudHandlers,
} from '../route-support'

const handlers = createAdminUserCrudHandlers({
    updateUser: updateUserService,
    deleteUser: deleteUserService,
})

export const { PATCH, DELETE } = handlers
