import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
  ListResourcesFilterSchema,
  ResourceListResponseSchema,
} from '@/lib/schemas/admin/resources'
import { listResourcesService } from '@/services/resources'
import { emitEvent } from '@/lib/inngest'

/**
 * GET /api/v1/admin/resources
 * List all resources with pagination and filters
 * Requires 'manage:resources' permission
 */
export async function GET(request: NextRequest) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult

    // Rate limiting: 60 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:list:${userId}`, {
      windowMs: 60_000,
      limit: 60,
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

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const parsed = ListResourcesFilterSchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      educationLevel: searchParams.get('educationLevel') ?? undefined,
      subject: searchParams.get('subject') ?? undefined,
      isFree: searchParams.get('isFree') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      order: searchParams.get('order') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          issues: parsed.error.format(),
        },
        { status: 400 }
      )
    }

    // Fetch resources
    const result = await listResourcesService(parsed.data)

    // Convert dates to ISO strings for validation
    const formattedData = result.data.map((resource) => ({
      ...resource,
      createdAt: resource.createdAt instanceof Date ? resource.createdAt.toISOString() : resource.createdAt,
      updatedAt: resource.updatedAt instanceof Date ? resource.updatedAt.toISOString() : resource.updatedAt,
    }))

    // Validate response format
    const validated = ResourceListResponseSchema.safeParse({
      data: formattedData,
      pagination: result.pagination,
    })

    if (!validated.success) {
      console.error('Response validation failed:', validated.error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json(validated.data, {
      headers: {
        'Cache-Control': 'private, max-age=30',
      },
    })
  } catch (error) {
    console.error('[GET /api/v1/admin/resources]', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/resources
 * Create a new resource
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult

    // Rate limiting: 10 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:create:${userId}`, {
      windowMs: 60_000,
      limit: 10,
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

    // Parse and validate request body
    const body = await request.json()
    const { CreateResourceSchema } = await import(
      '@/lib/schemas/admin/resources'
    )
    const parsed = CreateResourceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.format(),
        },
        { status: 400 }
      )
    }

    // Create resource
    const { createResourceService } = await import('@/services/resources')
    const resource = await createResourceService({
      ...parsed.data,
      adminId: userId,
    }) as any

    // Emit event
    await emitEvent('resource.created', {
      resourceId: resource.id,
      title: resource.title,
      educationLevel: resource.educationLevel.slug,
      subject: resource.subject.slug,
      createdBy: userId,
    })

    return NextResponse.json(
      {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        educationLevel: resource.educationLevel.slug,
        subject: resource.subject.slug,
        externalId: resource.externalId,
        isFree: resource.isFree,
        thumbUrl: resource.images?.[0]?.url || null,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
        files: [],
        stats: {
          totalUsers: 0,
          accessGrants: 0,
          subscriberAccess: 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/v1/admin/resources]', error)

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
