import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import {
  assertAdminResourceExists,
  createResourceImage,
  getResourceImages,
} from '@/lib/resources/services/admin'
import { uploadImage } from '@/lib/storage/cloudinary'
import { createAdminResourceImageHandlers } from '../../route-support'
import { serializeResourceImage } from '../media-route-support'

const handlers = createAdminResourceImageHandlers({
  assertResourceExists: assertAdminResourceExists,
  listImages: getResourceImages,
  uploadImage: async (file, folder, resourceId, altText) => {
    const result = await uploadImage(file, {
      folder,
      tags: ['resource', 'image', resourceId],
      context: altText ? { alt: altText } : undefined,
    })
    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  },
  createImage: createResourceImage,
  serializeImage: (image) => serializeResourceImage(image as any),
  prisma,
})

export const { GET, POST } = handlers
