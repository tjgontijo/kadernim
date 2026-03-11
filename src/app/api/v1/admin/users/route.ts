import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { UserRole } from '@/types/users/user-role'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
    CreateAdminUserSchema,
    ListUsersFilterSchema,
    UserListResponseSchema,
} from '@/schemas/users/admin-user-schemas'
import { listUsersService } from '@/services/users/list-users'
import { createAdminUserService } from '@/services/users/update-user'

/**
 * GET /api/v1/admin/users
 * List all users with pagination and filters
 * Admin only
 */
export async function GET(request: NextRequest) {
    try {
        // Require manage users permission
        const authResult = await requirePermission(request, 'manage:users')
        if (authResult instanceof NextResponse) {
            return authResult
        }

        const { userId } = authResult

        // Rate limiting: 60 requests per minute per admin
        const rl = checkRateLimit(`admin:users:list:${userId}`, {
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
        const parsed = ListUsersFilterSchema.safeParse({
            page: searchParams.get('page') ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
            q: searchParams.get('q') ?? undefined,
            role: searchParams.get('role') ?? undefined,
            banned: searchParams.get('banned') ?? undefined,
            emailVerified: searchParams.get('emailVerified') ?? undefined,
            hasSubscription: searchParams.get('hasSubscription') ?? undefined,
            subscriptionActive: searchParams.get('subscriptionActive') ?? undefined,
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

        // Fetch users
        const result = await listUsersService(parsed.data)

        // Convert dates to ISO strings for validation
        const formattedData = result.data.map((user) => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            subscription: user.subscription ? {
                ...user.subscription,
                expiresAt: user.subscription.expiresAt ? user.subscription.expiresAt.toISOString() : null,
            } : null,
        }))

        // Validate response format
        const validated = UserListResponseSchema.safeParse({
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
                'Cache-Control': 'private, max-age=10',
            },
        })
    } catch (error) {
        console.error('[GET /api/v1/admin/users]', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
/**
 * POST /api/v1/admin/users
 * Create a new user (login via OTP - password is random)
 * Admin only
 */
export async function POST(request: NextRequest) {
    try {
        // Require manage users permission
        const authResult = await requirePermission(request, 'manage:users')
        if (authResult instanceof NextResponse) {
            return authResult
        }

        const body = await request.json()
        const parsed = CreateAdminUserSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const user = await createAdminUserService(parsed.data)

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        if (error instanceof Error && error.message === 'USER_EMAIL_EXISTS') {
            return NextResponse.json(
                { error: 'Este e-mail já está cadastrado' },
                { status: 409 }
            )
        }
        console.error('[POST /api/v1/admin/users]', error)
        return NextResponse.json(
            { error: 'Erro ao criar usuário' },
            { status: 500 }
        )
    }
}
