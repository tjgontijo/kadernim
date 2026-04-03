import { deleteCommunityReference, uploadCommunityReference } from '@/server/clients/cloudinary/community-client'
import { prisma } from '@/server/db'
import { logger } from '@/server/logger'
import { emitEvent } from '@/lib/events/emit'
import { getCurrentYearMonth } from '@/lib/utils/date'
import { getCommunityConfig } from '@/lib/community/queries'
import { fail, ok, type Result } from '@/lib/shared/result'
import type { CreateCommunityRequestInput, CommunityAttachmentUpload } from '@/lib/community/types'
import type { UserRoleType } from '@/types/users/user-role'

async function uploadCommunityAttachments(files: File[]): Promise<CommunityAttachmentUpload[]> {
  if (files.length === 0) {
    return []
  }

  const tempFolderId = `temp_${Date.now()}`
  const uploads: CommunityAttachmentUpload[] = []

  for (const file of files) {
    const result = await uploadCommunityReference(file, 'community/uploads', tempFolderId)
    uploads.push({
      cloudinaryPublicId: result.publicId,
      url: result.url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })
  }

  return uploads
}

async function rollbackUploads(uploads: CommunityAttachmentUpload[]) {
  await Promise.all(
    uploads.map(async (upload) => {
      try {
        await deleteCommunityReference(upload.cloudinaryPublicId)
      } catch (error) {
        logger.warn(
          {
            domain: 'community',
            publicId: upload.cloudinaryPublicId,
            error: error instanceof Error ? error.message : String(error),
          },
          'Failed to cleanup uploaded community attachment'
        )
      }
    })
  )
}

export async function createCommunityRequest(
  userId: string,
  userRole: UserRoleType,
  data: CreateCommunityRequestInput
): Promise<Result<{ id: string }, string>> {
  const currentMonth = getCurrentYearMonth()
  const config = await getCommunityConfig()
  const attachments = data.attachments ?? []

  if (userRole === 'user') {
    return fail('Você precisa ser assinante para criar solicitações.')
  }

  const existingRequests = await prisma.communityRequest.count({
    where: {
      userId,
      votingMonth: currentMonth,
    },
  })

  if (existingRequests >= config.requests.limit) {
    return fail(`Você já criou ${config.requests.limit} pedido(s) este mês.`)
  }

  if (attachments.length > config.uploads.maxFiles) {
    return fail(`Você pode enviar no máximo ${config.uploads.maxFiles} arquivo(s).`)
  }

  const maxUploadSizeInBytes = config.uploads.maxSizeMB * 1024 * 1024
  const oversizedFile = attachments.find((file) => file.size > maxUploadSizeInBytes)
  if (oversizedFile) {
    return fail(`O arquivo ${oversizedFile.name} excede o limite de ${config.uploads.maxSizeMB}MB.`)
  }

  let uploadedAttachments: CommunityAttachmentUpload[] = []

  try {
    uploadedAttachments = await uploadCommunityAttachments(attachments)

    const request = await prisma.communityRequest.create({
      data: {
        title: data.title,
        description: data.description,
        hasBnccAlignment: data.hasBnccAlignment,
        educationLevelId: data.hasBnccAlignment ? data.educationLevelId : null,
        gradeId: data.hasBnccAlignment ? data.gradeId : null,
        subjectId: data.hasBnccAlignment ? data.subjectId : null,
        bnccSkillCodes: data.bnccSkillCodes || [],
        userId,
        votingMonth: currentMonth,
        status: 'voting',
        uploads:
          uploadedAttachments.length > 0
            ? {
                create: uploadedAttachments.map((upload) => ({
                  userId,
                  cloudinaryPublicId: upload.cloudinaryPublicId,
                  url: upload.url,
                  fileName: upload.fileName,
                  fileType: upload.fileType,
                  fileSize: upload.fileSize,
                })),
              }
            : undefined,
      },
      select: { id: true, title: true, userId: true },
    })

    await emitEvent({
      type: 'community.request.created',
      payload: {
        requestId: request.id,
        userId: request.userId,
        title: request.title,
      },
    })

    return ok({ id: request.id })
  } catch (error) {
    await rollbackUploads(uploadedAttachments)
    logger.error(
      { domain: 'community', userId, error: error instanceof Error ? error.message : String(error) },
      'Failed to create community request'
    )

    if (error instanceof Error && error.message === 'User not found') {
      return fail(error.message)
    }

    return fail(error instanceof Error ? error.message : 'Erro ao criar solicitação')
  }
}
