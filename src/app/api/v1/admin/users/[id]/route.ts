import { updateUserService, deleteUserService } from '@/services/users/update-user'
import {
    createAdminUserCrudHandlers,
} from '../route-support'

const handlers = createAdminUserCrudHandlers({
    updateUser: updateUserService,
    deleteUser: deleteUserService,
})

export const { PATCH, DELETE } = handlers
