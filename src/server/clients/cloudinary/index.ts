// Cloudinary configuration
export { cloudinary } from './config'

// Image operations
export {
  uploadImage,
  deleteImage,
  getImageUrl,
  type ImageUploadResult,
} from './image-client'

// Video operations
export {
  uploadVideo,
  deleteVideo,
  getVideoUrl,
  type VideoUploadResult,
} from './video-client'

// File operations
export {
  uploadFile,
  deleteFile,
  getFileUrl,
  type FileUploadResult,
} from './file-client'

// Community operations
export {
  uploadCommunityReference,
  deleteCommunityReference,
  type CommunityReferenceUploadResult,
} from './community-client'
