import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { getResourceAccessService, grantAccessService } from '@/services/resources/admin/access-service'

/**
 * GET /api/v1/admin/resources/:id/access
 * Get all access records for a resource
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

    const { id: resourceId } = await params

    // Rate limiting: 30 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:access:list:${authResult.userId}`, {
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

    // Get access records
    const accessList = await getResourceAccessService(resourceId)

    return NextResponse.json(
      {
        accessList,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10',
        },
      }
    )
  } catch (error) {
    console.error('[GET /api/v1/admin/resources/:id/access]', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to get access records' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/resources/:id/access
 * Grant access to a resource for a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: resourceId } = await params

    // Rate limiting: 20 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:access:grant:${authResult.userId}`, {
      windowMs: 60_000,
      limit: 20,
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

    // Parse body
    const body = await request.json()
    const { userId, expiresAt } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Grant access
    const access = await grantAccessService({
      resourceId,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    return NextResponse.json(access, { status: 201 })
  } catch (error) {
    console.error('[POST /api/v1/admin/resources/:id/access]', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes('already has access')) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to grant access' },
      { status: 500 }
    )
  }
}
