import { NextRequest, NextResponse } from 'next/server'
import { deleteVideo } from '@/server/clients/cloudinary/video-client'
import {
  UpdateResourceVideoSchema,
} from '@/schemas/resources/admin-resource-schemas'
import {
  deleteResourceVideo,
  getResourceVideoById,
  updateResourceVideo,
} from '@/services/resources/admin'
import { parseWithSchema } from '../../../route-support'
import {
  deleteCloudinaryAsset,
  ensureResourceMediaOwnership,
  resolveResourceMediaParams,
  resourceMediaErrorResponse,
  serializeResourceVideo,
} from '../../media-route-support'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const parsed = parseWithSchema(
      UpdateResourceVideoSchema,
      await req.json(),
      'Validation failed'
    )
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const { id, mediaId } = await resolveResourceMediaParams(params, 'videoId')
    const video = ensureResourceMediaOwnership('video', id, await getResourceVideoById(mediaId))
    if (video instanceof NextResponse) {
      return video
    }

    return NextResponse.json(
      serializeResourceVideo(await updateResourceVideo(id, mediaId, parsed))
    )
  } catch (error) {
    return resourceMediaErrorResponse(
      '[PUT /api/v1/admin/resources/[id]/videos/[videoId]]',
      error,
      'Failed to update video'
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { id, mediaId } = await resolveResourceMediaParams(params, 'videoId')
    const video = ensureResourceMediaOwnership('video', id, await getResourceVideoById(mediaId))
    if (video instanceof NextResponse) {
      return video
    }

    await deleteCloudinaryAsset(
      deleteVideo,
      video.cloudinaryPublicId,
      '[DELETE VIDEO] Cloudinary deletion error:'
    )
    await deleteResourceVideo(id, mediaId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return resourceMediaErrorResponse(
      '[DELETE /api/v1/admin/resources/[id]/videos/[videoId]]',
      error,
      'Failed to delete video'
    )
  }
}
