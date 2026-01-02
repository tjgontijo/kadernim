import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { BulkUpdateResourcesSchema } from '@/lib/schemas/admin/resources'

/**
 * POST /api/v1/admin/resources/bulk/update
 * Update multiple resources
 */
export async function POST(request: NextRequest) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult

    // Rate limiting: 5 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:bulk:update:${userId}`, {
      windowMs: 60_000,
      limit: 5,
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
    const parsed = BulkUpdateResourcesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.format(),
        },
        { status: 400 }
      )
    }

    // Execute bulk update
    const { bulkUpdateResourcesService } = await import(
      '@/services/resources/admin/bulk-service'
    )
    const result = await bulkUpdateResourcesService(parsed.data, userId)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[POST /api/v1/admin/resources/bulk/update]', error)
    return NextResponse.json(
      { error: 'Failed to update resources' },
      { status: 500 }
    )
  }
}
