import { NextResponse } from 'next/server'

export interface ResourceMediaParams {
  id: string
  mediaId: string
}

export async function resolveResourceMediaParams<T extends { id: string }>(
  params: Promise<T>,
  mediaParamKey: keyof T
): Promise<ResourceMediaParams> {
  const resolved = await params

  return {
    id: resolved.id,
    mediaId: String(resolved[mediaParamKey]),
  }
}

export function ensureResourceMediaOwnership<T extends { resourceId: string }>(
  kind: 'image' | 'video',
  resourceId: string,
  media: T | null
) {
  if (!media) {
    return NextResponse.json({ error: `${capitalize(kind)} not found` }, { status: 404 })
  }

  if (media.resourceId !== resourceId) {
    return NextResponse.json(
      { error: `${capitalize(kind)} does not belong to this resource` },
      { status: 400 }
    )
  }

  return media
}

export function resourceMediaErrorResponse(
  context: string,
  error: unknown,
  fallbackMessage: string
) {
  console.error(context, error)
  return NextResponse.json({ error: fallbackMessage }, { status: 500 })
}

export function serializeResourceImage(image: {
  id: string
  resourceId: string
  cloudinaryPublicId: string
  url?: string | null
  alt: string | null
  order: number
  createdAt: Date
}) {
  return {
    id: image.id,
    resourceId: image.resourceId,
    cloudinaryPublicId: image.cloudinaryPublicId,
    url: image.url ?? null,
    alt: image.alt,
    order: image.order,
    createdAt: image.createdAt.toISOString(),
  }
}

export function serializeResourceVideo(video: {
  id: string
  resourceId: string
  title: string
  cloudinaryPublicId: string
  url?: string | null
  thumbnail: string | null
  duration: number | null
  order: number
  createdAt: Date
}) {
  return {
    id: video.id,
    resourceId: video.resourceId,
    title: video.title,
    cloudinaryPublicId: video.cloudinaryPublicId,
    url: video.url ?? null,
    thumbnail: video.thumbnail,
    duration: video.duration,
    order: video.order,
    createdAt: video.createdAt.toISOString(),
  }
}

export function serializeResourceFile(file: {
  id: string
  name: string
  cloudinaryPublicId: string
  url: string | null
  fileType: string | null
  sizeBytes: number | null
  createdAt: Date
}) {
  return {
    id: file.id,
    name: file.name,
    cloudinaryPublicId: file.cloudinaryPublicId,
    url: file.url,
    fileType: file.fileType,
    sizeBytes: file.sizeBytes,
    createdAt: file.createdAt.toISOString(),
  }
}

export async function deleteCloudinaryAsset(
  deleter: (publicId: string) => Promise<unknown>,
  publicId: string,
  context: string
) {
  try {
    await deleter(publicId)
  } catch (error) {
    console.error(context, error)
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
