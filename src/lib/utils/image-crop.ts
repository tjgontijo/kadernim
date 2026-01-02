/**
 * Utility functions for image cropping
 */

export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues
        image.src = url
    })

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    flip = { horizontal: false, vertical: false },
    maxWidth = 600,
    maxHeight = 600
): Promise<Blob | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    // Calculate quality scaling
    // We want the output to be at most maxWidth x maxHeight
    let targetWidth = pixelCrop.width
    let targetHeight = pixelCrop.height

    if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight)
        targetWidth = targetWidth * ratio
        targetHeight = targetHeight * ratio
    }

    // Set canvas size to the target size
    canvas.width = targetWidth
    canvas.height = targetHeight

    // Scale and translate to handle flipping/rotation
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Draw the cropped and RESIZED image onto the canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
    )

    // Export as JPEG with 80% quality (excellent balance of size/quality)
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob)
        }, 'image/jpeg', 0.8)
    })
}

