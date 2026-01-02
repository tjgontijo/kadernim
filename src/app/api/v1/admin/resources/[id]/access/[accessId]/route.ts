import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { revokeAccessService } from '@/services/resources/admin/access-service'

/**
 * DELETE /api/v1/admin/resources/:id/access/:accessId
 * Revoke access to a resource
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accessId: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: resourceId, accessId } = await params

    // Rate limiting: 30 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:access:revoke:${authResult.userId}`, {
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

    // Revoke access
    await revokeAccessService(resourceId, accessId)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/v1/admin/resources/:id/access/:accessId]', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to revoke access' },
      { status: 500 }
    )
  }
}
