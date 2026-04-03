import { uploadFile } from '@/server/clients/cloudinary/file-client'
import {
  assertAdminResourceExists,
  createFileService,
} from '@/lib/resources/services/admin'
import {
  createAdminResourceFileUploadHandler,
} from '../../route-support'
import { serializeResourceFile } from '../media-route-support'

export const POST = createAdminResourceFileUploadHandler({
  uploadFile,
  assertResourceExists: assertAdminResourceExists,
  createFile: createFileService,
  serializeFile: (file) => serializeResourceFile(file as never),
})
