import { deleteImage, uploadImage } from '@/server/clients/cloudinary/image-client'
import { prisma } from '@/server/db'
import { logger } from '@/server/logger'
import { fail, ok, type Result } from '@/lib/shared/result'
import type { UploadAccountAvatarInput } from '@/lib/account/schemas'

export async function updateAccountAvatar(
  userId: string,
  input: UploadAccountAvatarInput
): Promise<Result<{ image: string }, 'User not found' | 'Failed to update account avatar'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    return fail('User not found')
  }

  try {
    const upload = await uploadImage(
      input.file,
      'avatar',
      `user-avatar-${userId}`,
      'User Avatar'
    )

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { image: upload.url },
        select: { image: true },
      })

      return ok({ image: updatedUser.image ?? '' })
    } catch (error) {
      try {
        await deleteImage(upload.publicId)
      } catch (cleanupError) {
        logger.warn(
          {
            domain: 'account',
            userId,
            publicId: upload.publicId,
            error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          },
          'Failed to rollback avatar upload after database error'
        )
      }

      throw error
    }
  } catch (error) {
    logger.error(
      { domain: 'account', userId, error: error instanceof Error ? error.message : String(error) },
      'Failed to update account avatar'
    )
    return fail('Failed to update account avatar')
  }
}
