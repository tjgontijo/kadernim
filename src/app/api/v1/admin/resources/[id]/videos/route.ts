import { NextRequest, NextResponse } from 'next/server'
import {
  assertAdminResourceExists,
  createResourceVideo,
  getResourceVideos,
} from '@/lib/resources/services/admin'
import { uploadVideoChunked, getVideoThumbnail } from '@/lib/storage/cloudinary'
import { createAdminResourceVideoHandlers } from '../../route-support'
import { serializeResourceVideo } from '../media-route-support'

const handlers = createAdminResourceVideoHandlers({
  assertResourceExists: assertAdminResourceExists,
  listVideos: getResourceVideos,
  uploadVideo: async (file, folder, resourceId, title) => {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadVideoChunked(buffer, {
      folder: `${folder}/${resourceId}`,
      tags: ['resource', 'video', resourceId],
      context: { title },
    })
    return {
      publicId: result.public_id,
      url: result.secure_url,
      title,
      duration: result.duration || 0,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  },
  getThumbnail: getVideoThumbnail,
  createVideo: createResourceVideo,
  serializeVideo: (video) => serializeResourceVideo(video as any),
})

export const { GET, POST } = handlers
