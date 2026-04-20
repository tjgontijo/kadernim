import { NextRequest, NextResponse } from 'next/server'
import { ZodType } from 'zod'
import {
  CreateResourceSchema,
  ListResourcesFilterSchema,
  ResourceListResponseSchema,
  UpdateResourceSchema,
} from '@/lib/resources/schemas'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'

type RateLimitConfig = {
  key: string
  limit: number
  windowMs?: number
}

export async function authorizeAdminResourceRequest(
  request: NextRequest,
  rateLimitConfig: RateLimitConfig
) {
  const authResult = await requirePermission(request, 'manage:resources')
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const rl = checkRateLimit(`${rateLimitConfig.key}:${authResult.userId}`, {
    windowMs: rateLimitConfig.windowMs ?? 60_000,
    limit: rateLimitConfig.limit,
  })

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfter),
        },
      }
    )
  }

  return authResult
}

export function parseWithSchema<T>(
  schema: ZodType<T>,
  input: unknown,
  error: string
) {
  const parsed = schema.safeParse(input)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error,
        issues: parsed.error.format(),
      },
      { status: 400 }
    )
  }

  return parsed.data
}

export function adminResourceServerError(message: string, error: unknown) {
  console.error(message, error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export function adminResourceNotFound(error: string = 'Not found') {
  return NextResponse.json({ error }, { status: 404 })
}

export function formatResourceTimestamps<T extends { createdAt: Date | string; updatedAt: Date | string }>(
  resource: T
) {
  return {
    ...resource,
    createdAt:
      resource.createdAt instanceof Date
        ? resource.createdAt.toISOString()
        : resource.createdAt,
    updatedAt:
      resource.updatedAt instanceof Date
        ? resource.updatedAt.toISOString()
        : resource.updatedAt,
  }
}

export async function resolveRouteId(
  params: Promise<{ id: string }>
) {
  const { id } = await params
  return id
}

export function validateResourceListResponse(input: unknown) {
  const validated = ResourceListResponseSchema.safeParse(input)
  if (!validated.success) {
    return adminResourceServerError('Response validation failed:', validated.error)
  }

  return validated.data
}

export function buildCreatedResourceResponse(resource: {
  id: string
  title: string
  description: string | null
  educationLevel: { slug: string }
  subject: { slug: string }
  images?: Array<{ url: string | null }>
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    educationLevel: resource.educationLevel.slug,
    subject: resource.subject.slug,
    thumbUrl: resource.images?.[0]?.url || null,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
    files: [],
    stats: {
      totalDownloads: 0,
      averageRating: 0,
    },
  }
}

export function parseAdminResourceListFilters(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  return parseWithSchema(
    ListResourcesFilterSchema,
    {
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      educationLevel: searchParams.get('educationLevel') ?? undefined,
      grade: searchParams.get('grade') ?? undefined,
      subject: searchParams.get('subject') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      order: searchParams.get('order') ?? undefined,
    },
    'Invalid parameters'
  )
}

export function adminResourceConflict(error: string) {
  return NextResponse.json({ error }, { status: 409 })
}

export function createAdminResourceCollectionHandlers(config: {
  listResources: (filters: {
    page: number
    limit: number
    q?: string
    educationLevel?: string
    grade?: string
    subject?: string
    sortBy: 'title' | 'createdAt' | 'updatedAt'
    order: 'asc' | 'desc'
  }) => Promise<{
    data: Array<{ createdAt: Date | string; updatedAt: Date | string }>
    pagination: Record<string, unknown>
  }>
  createResource: (input: {
    title: string
    description?: string | null
    educationLevel: string
    subject: string
    thumbUrl?: string | null
    grades: string[]
    resourceType?: string
    pagesCount?: number | null
    estimatedDurationMinutes?: number | null

    adminId: string
  }) => Promise<unknown>
  buildCreatedResponse: (resource: unknown) => unknown
}) {
  return {
    GET: async function GET(request: NextRequest) {
      try {
        const authResult = await authorizeAdminResourceRequest(request, {
          key: 'admin:resources:list',
          limit: 60,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        const parsed = parseAdminResourceListFilters(request)
        if (parsed instanceof NextResponse) {
          return parsed
        }

        const result = await config.listResources(parsed)
        const validated = validateResourceListResponse({
          data: result.data.map(formatResourceTimestamps),
          pagination: result.pagination,
        })
        if (validated instanceof NextResponse) {
          return validated
        }

        return NextResponse.json(validated, {
          headers: {
            'Cache-Control': 'private, max-age=30',
          },
        })
      } catch (error) {
        return adminResourceServerError('[GET /api/v1/admin/resources]', error)
      }
    },
    POST: async function POST(request: NextRequest) {
      try {
        const authResult = await authorizeAdminResourceRequest(request, {
          key: 'admin:resources:create',
          limit: 10,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        const parsed = parseWithSchema(
          CreateResourceSchema,
          await request.json(),
          'Validation failed'
        )
        if (parsed instanceof NextResponse) {
          return parsed
        }

        const resource = await config.createResource({
          ...parsed,
          adminId: authResult.userId,
        })
        const createdResource = resource as {
          id: string
          title: string
          educationLevel: { slug: string }
          subject: { slug: string }
        }

        return NextResponse.json(config.buildCreatedResponse(resource), { status: 201 })
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          return adminResourceConflict(error.message)
        }

        return adminResourceServerError('[POST /api/v1/admin/resources]', error)
      }
    },
  }
}

export function createAdminResourceCrudHandlers(config: {
  getDetail: (id: string) => Promise<unknown>
  updateResource: (input: {
    id: string
    title?: string
    description?: string | null
    educationLevel?: string
    subject?: string
    thumbUrl?: string | null
    grades?: string[]
    resourceType?: string
    pagesCount?: number | null
    estimatedDurationMinutes?: number | null

    adminId: string
  }) => Promise<unknown>
  deleteResource: (id: string, adminId: string) => Promise<unknown>
}) {
  return {
    GET: async function GET(
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const authResult = await authorizeAdminResourceRequest(request, {
          key: 'admin:resources:get',
          limit: 60,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        return NextResponse.json(await config.getDetail(await resolveRouteId(params)), {
          headers: {
            'Cache-Control': 'private, max-age=30',
          },
        })
      } catch (error) {
        if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
          return adminResourceNotFound()
        }

        return adminResourceServerError('[GET /api/v1/admin/resources/:id]', error)
      }
    },
    PUT: async function PUT(
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const authResult = await authorizeAdminResourceRequest(request, {
          key: 'admin:resources:update',
          limit: 30,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        const parsed = parseWithSchema(
          UpdateResourceSchema,
          await request.json(),
          'Validation failed'
        )
        if (parsed instanceof NextResponse) {
          return parsed
        }

        const id = await resolveRouteId(params)
        await config.updateResource({ ...parsed, id, adminId: authResult.userId })

        return NextResponse.json(await config.getDetail(id))
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message === 'RESOURCE_NOT_FOUND' || error.message.includes('not found'))
        ) {
          return adminResourceNotFound()
        }

        return adminResourceServerError('[PUT /api/v1/admin/resources/:id]', error)
      }
    },
    DELETE: async function DELETE(
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const authResult = await authorizeAdminResourceRequest(request, {
          key: 'admin:resources:delete',
          limit: 10,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        await config.deleteResource(await resolveRouteId(params), authResult.userId)

        return new NextResponse(null, { status: 204 })
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return adminResourceNotFound(error.message)
        }

        return adminResourceServerError('[DELETE /api/v1/admin/resources/:id]', error)
      }
    },
  }
}




export function createAdminResourceFileUploadHandler(config: {
  uploadFile: (file: File, folder: string, resourceId: string) => Promise<{
    fileName: string
    publicId: string
    url: string
    fileType?: string
    sizeBytes?: number
  }>
  assertResourceExists: (resourceId: string) => Promise<unknown>
  createFile: (input: {
    resourceId: string
    name: string
    cloudinaryPublicId: string
    url: string
    fileType?: string
    sizeBytes?: number
    adminId: string
  }) => Promise<unknown>
  serializeFile: (file: unknown) => unknown
}) {
  return async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const authResult = await authorizeAdminResourceRequest(request, {
        key: 'admin:resources:files:upload',
        limit: 20,
      })
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const { id } = await params
      await config.assertResourceExists(id)

      const formData = await request.formData()
      const file = formData.get('file')
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      const uploadResult = await config.uploadFile(file, 'resources/files', id)
      const created = await config.createFile({
        resourceId: id,
        name: uploadResult.fileName,
        cloudinaryPublicId: uploadResult.publicId,
        url: uploadResult.url,
        fileType: uploadResult.fileType,
        sizeBytes: uploadResult.sizeBytes,
        adminId: authResult.userId,
      })

      return NextResponse.json(config.serializeFile(created), { status: 201 })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'RESOURCE_NOT_FOUND' || error.message.includes('not found')) {
          return adminResourceNotFound('Resource not found')
        }

        if (error.message.includes('not allowed') || error.message.includes('too large')) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
      }

      return adminResourceServerError('[POST /api/v1/admin/resources/:id/files]', error)
    }
  }
}

export function createAdminResourceImageHandlers(config: {
  assertResourceExists: (resourceId: string) => Promise<unknown>
  listImages: (resourceId: string) => Promise<unknown>
  uploadImage: (
    file: File,
    folder: string,
    resourceId: string,
    altText?: string
  ) => Promise<{ publicId: string; url: string }>
  createImage: (input: {
    resourceId: string
    cloudinaryPublicId: string
    url: string
    alt?: string
  }) => Promise<unknown>
  serializeImage: (image: unknown) => unknown
}) {
  return {
    GET: async function GET(
      _request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const { id } = await params
        await config.assertResourceExists(id)

        return NextResponse.json({ images: await config.listImages(id) })
      } catch (error) {
        if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
          return adminResourceNotFound('Resource not found')
        }

        return adminResourceServerError('[GET /api/v1/admin/resources/:id/images]', error)
      }
    },
    POST: async function POST(
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const { id } = await params
        const formData = await request.formData()
        const file = formData.get('file')
        const altText = formData.get('alt')

        if (!(file instanceof File)) {
          return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        await config.assertResourceExists(id)

        const uploadResult = await config.uploadImage(
          file,
          'resources/images',
          id,
          typeof altText === 'string' ? altText : undefined
        )
        const image = await config.createImage({
          resourceId: id,
          cloudinaryPublicId: uploadResult.publicId,
          url: uploadResult.url,
          alt: typeof altText === 'string' ? altText : undefined,
        })

        return NextResponse.json(config.serializeImage(image), { status: 201 })
      } catch (error) {
        if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
          return adminResourceNotFound('Resource not found')
        }

        return adminResourceServerError('[POST /api/v1/admin/resources/:id/images]', error)
      }
    },
  }
}

export function createAdminResourceVideoHandlers(config: {
  assertResourceExists: (resourceId: string) => Promise<unknown>
  listVideos: (resourceId: string) => Promise<unknown>
  uploadVideo: (
    file: File,
    folder: string,
    resourceId: string,
    title: string
  ) => Promise<{ publicId: string; url: string; duration?: number }>
  getThumbnail: (publicId: string, time?: number) => string
  createVideo: (input: {
    resourceId: string
    title: string
    cloudinaryPublicId: string
    url: string
    thumbnail: string
    duration?: number
  }) => Promise<unknown>
  serializeVideo: (video: unknown) => unknown
}) {
  return {
    GET: async function GET(
      _request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const { id } = await params
        await config.assertResourceExists(id)

        return NextResponse.json({ videos: await config.listVideos(id) })
      } catch (error) {
        if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
          return adminResourceNotFound('Resource not found')
        }

        return adminResourceServerError('[GET /api/v1/admin/resources/:id/videos]', error)
      }
    },
    POST: async function POST(
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const { id } = await params
        const formData = await request.formData()
        const file = formData.get('file')
        const title = formData.get('title')

        if (!(file instanceof File) || typeof title !== 'string' || !title.trim()) {
          return NextResponse.json(
            { error: 'File and title are required' },
            { status: 400 }
          )
        }

        await config.assertResourceExists(id)

        const uploadResult = await config.uploadVideo(file, 'resources/videos', id, title)
        const video = await config.createVideo({
          resourceId: id,
          title,
          cloudinaryPublicId: uploadResult.publicId,
          url: uploadResult.url,
          thumbnail: config.getThumbnail(uploadResult.publicId, 0),
          duration: uploadResult.duration,
        })

        return NextResponse.json(config.serializeVideo(video), { status: 201 })
      } catch (error) {
        if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
          return adminResourceNotFound('Resource not found')
        }

        return adminResourceServerError('[POST /api/v1/admin/resources/:id/videos]', error)
      }
    },
  }
}
