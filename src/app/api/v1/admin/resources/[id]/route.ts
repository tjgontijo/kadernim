import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { UserRole } from '@/types/users/user-role'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
  UpdateResourceSchema,
} from '@/schemas/resources/admin-resource-schemas'
import {
  deleteResourceService,
  getAdminResourceDetail,
  updateResourceService,
} from '@/services/resources'


/**
 * GET /api/v1/admin/resources/:id
 * Get resource details
 * Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const { id } = await params

    // Rate limiting: 60 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:get:${userId}`, {
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

    const validated = await getAdminResourceDetail(id)

    return NextResponse.json(validated, {
      headers: {
        'Cache-Control': 'private, max-age=30',
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    console.error('[GET /api/v1/admin/resources/:id]', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/admin/resources/:id
 * Update a resource
 * Admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const { id } = await params

    // Rate limiting: 30 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:update:${userId}`, {
      windowMs: 60_000,
      limit: 30,
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
    const parsed = UpdateResourceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.format(),
        },
        { status: 400 }
      )
    }

    await updateResourceService({
      id,
      ...parsed.data,
      adminId: userId,
    })
    const updated = await getAdminResourceDetail(id)

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/v1/admin/resources/:id]', error)

    if (error instanceof Error) {
      if (error.message === 'RESOURCE_NOT_FOUND' || error.message.includes('not found')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/admin/resources/:id
 * Delete a resource
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const { id } = await params

    // Rate limiting: 10 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:delete:${userId}`, {
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

    await deleteResourceService(id, userId)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/v1/admin/resources/:id]', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
