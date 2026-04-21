import { uploadImage } from '@/lib/storage/cloudinary'
import { updateUserAvatarService } from '@/lib/users/services'
import { createAdminUserAvatarHandler } from '../../route-support'

export const POST = createAdminUserAvatarHandler({
  uploadImage: async (file, folder, publicId, altText) => {
    const result = await uploadImage(file, {
      folder,
      publicId,
      context: altText ? { alt: altText } : undefined,
    })
    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  },
  updateUserAvatar: updateUserAvatarService,
})
