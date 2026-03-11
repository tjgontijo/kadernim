import { uploadImage } from '@/server/clients/cloudinary/image-client'
import { updateUserAvatarService } from '@/services/users/update-user'
import { createAdminUserAvatarHandler } from '../../route-support'

export const POST = createAdminUserAvatarHandler({
    uploadImage,
    updateUserAvatar: updateUserAvatarService,
})
