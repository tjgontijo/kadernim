import { cloudinary } from './config'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

const FOLDER = 'community/references'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB for references

export interface CommunityReferenceUploadResult {
    publicId: string
    url: string
}

/**
 * Uploads a reference image for a community request.
 * These are temporary images subject to the 30-day cleanup policy.
 */
export async function uploadCommunityReference(
    file: File,
    folder: string,
    requestId: string
): Promise<CommunityReferenceUploadResult> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = MAX_FILE_SIZE / 1024 / 1024;
        throw new Error(`Arquivo muito grande. O limite é ${sizeMB}MB`);
    }

    // Validate file type (Images or PDF)
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
        throw new Error('Tipo de arquivo não suportado. Use imagens ou PDF.');
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder: `${folder}/${requestId}`,
            public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            resource_type: isImage ? 'image' : 'raw',
            tags: ['community', 'reference', requestId],
            context: {
                requestId: requestId,
            },
        };

        // Add image specific optimizations
        if (isImage) {
            uploadOptions.quality = 'auto';
            uploadOptions.format = 'webp';
        }

        cloudinary.uploader.upload_stream(
            uploadOptions,
            (
                error: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined
            ) => {
                if (error) {
                    reject(new Error(`Reference upload failed: ${error.message}`))
                } else if (result) {
                    resolve({
                        publicId: result.public_id,
                        url: result.secure_url,
                    })
                } else {
                    reject(new Error('Reference upload failed: No result returned'))
                }
            }
        ).end(buffer)
    })
}

/**
 * Deletes a reference image from Cloudinary.
 */
export async function deleteCommunityReference(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(new Error(`Reference deletion failed: ${error.message}`))
            } else if (result && (result.result === 'ok' || result.result === 'not found')) {
                resolve()
            } else {
                reject(new Error(`Reference deletion failed: ${result?.result || 'Unknown error'}`))
            }
        })
    })
}
