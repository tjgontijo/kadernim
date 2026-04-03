import { uploadImage } from '@/server/clients/cloudinary/image-client'
import { updateUserAvatarService } from '@/lib/users/services'
import { createAdminUserAvatarHandler } from '../../route-support'

export const POST = createAdminUserAvatarHandler({
    uploadImage,
    updateUserAvatar: updateUserAvatarService,
})
