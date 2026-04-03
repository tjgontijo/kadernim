import { NextRequest, NextResponse } from 'next/server'
import {
  assertAdminResourceExists,
  createResourceImage,
  getResourceImages,
} from '@/lib/resources/services/admin'
import { uploadImage } from '@/server/clients/cloudinary/image-client'
import { createAdminResourceImageHandlers } from '../../route-support'
import { serializeResourceImage } from '../media-route-support'

const handlers = createAdminResourceImageHandlers({
  assertResourceExists: assertAdminResourceExists,
  listImages: getResourceImages,
  uploadImage,
  createImage: createResourceImage,
  serializeImage: (image) => serializeResourceImage(image as never),
})

export const { GET, POST } = handlers
