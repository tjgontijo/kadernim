import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/middleware'
import { UserRole } from '@/types/user-role'
import { checkRateLimit } from '@/lib/helpers/rate-limit'
import { searchUsersService } from '@/services/users/search-users'

/**
 * GET /api/v1/admin/users/search?q=query
 * Search users by name or email
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireRole(request, UserRole.admin)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult

    // Rate limiting: 30 requests per minute per admin
    const rl = checkRateLimit(`admin:users:search:${userId}`, {
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

    // Get search query
    const query = request.nextUrl.searchParams.get('q') ?? ''
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '10'), 50)

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          users: [],
        },
        {
          headers: {
            'Cache-Control': 'private, max-age=10',
          },
        }
      )
    }

    // Search users
    const users = await searchUsersService({
      query: query.trim(),
      limit,
    })

    return NextResponse.json(
      {
        users,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10',
        },
      }
    )
  } catch (error) {
    console.error('[GET /api/v1/admin/users/search]', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
