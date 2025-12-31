import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables
const cloudinaryUrl = process.env.CLOUDINARY_URL

if (!cloudinaryUrl) {
  throw new Error('CLOUDINARY_URL environment variable is not set')
}

// Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
const urlParts = cloudinaryUrl.replace('cloudinary://', '').split('@')
const cloudName = urlParts[1]
const credentials = urlParts[0].split(':')
const apiKey = credentials[0]
const apiSecret = credentials[1]

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export { cloudinary }
export const CLOUDINARY_CLOUD_NAME = cloudName
