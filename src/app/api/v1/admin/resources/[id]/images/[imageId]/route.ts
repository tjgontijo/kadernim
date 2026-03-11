import { NextRequest, NextResponse } from 'next/server'
import { deleteImage } from '@/server/clients/cloudinary/image-client'
import { UpdateResourceImageSchema } from '@/schemas/resources/admin-resource-schemas'
import {
  deleteResourceImage,
  getResourceImageById,
  updateResourceImage,
} from '@/services/resources/admin'
import { parseWithSchema } from '../../../route-support'
import {
  deleteCloudinaryAsset,
  ensureResourceMediaOwnership,
  resolveResourceMediaParams,
  resourceMediaErrorResponse,
  serializeResourceImage,
} from '../../media-route-support'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const parsed = parseWithSchema(UpdateResourceImageSchema, await req.json(), 'Validation failed')
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const { id, mediaId } = await resolveResourceMediaParams(params, 'imageId')
    const image = ensureResourceMediaOwnership('image', id, await getResourceImageById(mediaId))
    if (image instanceof NextResponse) {
      return image
    }

    const updateInput = {
      ...parsed,
      alt: parsed.alt ?? undefined,
    }

    return NextResponse.json(serializeResourceImage(await updateResourceImage(id, mediaId, updateInput)))
  } catch (error) {
    return resourceMediaErrorResponse('[PUT /api/v1/admin/resources/[id]/images/[imageId]]', error, 'Failed to update image')
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, mediaId } = await resolveResourceMediaParams(params, 'imageId')
    const image = ensureResourceMediaOwnership('image', id, await getResourceImageById(mediaId))
    if (image instanceof NextResponse) {
      return image
    }

    await deleteCloudinaryAsset(
      deleteImage,
      image.cloudinaryPublicId,
      '[DELETE IMAGE] Cloudinary deletion error:'
    )
    await deleteResourceImage(id, mediaId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return resourceMediaErrorResponse('[DELETE /api/v1/admin/resources/[id]/images/[imageId]]', error, 'Failed to delete image')
  }
}
