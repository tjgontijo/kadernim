import { NextRequest, NextResponse } from 'next/server'
import { uploadVideo, getVideoThumbnail } from '@/server/clients/cloudinary/video-client'
import {
  assertAdminResourceExists,
  createResourceVideo,
  getResourceVideos,
} from '@/services/resources/admin'
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
