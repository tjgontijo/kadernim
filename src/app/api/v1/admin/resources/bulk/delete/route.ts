import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/middleware'
import { UserRole } from '@/types/user-role'
import { checkRateLimit } from '@/lib/helpers/rate-limit'
import { BulkDeleteResourcesSchema } from '@/lib/schemas/admin/resources'

/**
 * POST /api/v1/admin/resources/bulk/delete
 * Delete multiple resources
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireRole(request, UserRole.admin)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult

    // Rate limiting: 5 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:bulk:delete:${userId}`, {
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
    const parsed = BulkDeleteResourcesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.format(),
        },
        { status: 400 }
      )
    }

    // Execute bulk delete
    const { bulkDeleteResourcesService } = await import(
      '@/services/resources/bulk-operations'
    )
    const result = await bulkDeleteResourcesService(parsed.data, userId)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[POST /api/v1/admin/resources/bulk/delete]', error)
    return NextResponse.json(
      { error: 'Failed to delete resources' },
      { status: 500 }
    )
  }
}
