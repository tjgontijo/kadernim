import { NextRequest, NextResponse } from 'next/server'
import {
  assertAdminResourceExists,
  createResourceVideo,
  getResourceVideos,
} from '@/lib/resources/services/admin'
import { uploadVideo, getVideoThumbnail } from '@/server/clients/cloudinary/video-client'
import { createAdminResourceVideoHandlers } from '../../route-support'
import { serializeResourceVideo } from '../media-route-support'

const handlers = createAdminResourceVideoHandlers({
  assertResourceExists: assertAdminResourceExists,
  listVideos: getResourceVideos,
  uploadVideo,
  getThumbnail: getVideoThumbnail,
  createVideo: createResourceVideo,
  serializeVideo: (video) => serializeResourceVideo(video as never),
})

export const { GET, POST } = handlers
