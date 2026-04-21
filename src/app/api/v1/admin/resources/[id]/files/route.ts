import { uploadRaw } from '@/lib/storage/cloudinary'
import {
  assertAdminResourceExists,
  createFileService,
} from '@/lib/resources/services/admin'
import {
  createAdminResourceFileUploadHandler,
} from '../../route-support'
import { serializeResourceFile } from '../media-route-support'

export const POST = createAdminResourceFileUploadHandler({
  uploadFile: async (file, folder, resourceId) => {
    const result = await uploadRaw(file, {
      folder: `${folder}/${resourceId}`,
      tags: ['resource', 'file', resourceId],
      context: { originalName: file.name },
    })
    return {
      publicId: result.public_id,
      url: result.secure_url,
      fileName: file.name,
      fileType: file.type,
      sizeBytes: file.size,
    }
  },
  assertResourceExists: assertAdminResourceExists,
  createFile: createFileService,
  serializeFile: (file) => serializeResourceFile(file as any),
})
