import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { UserRole } from '@/types/user-role'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
    ListUsersFilterSchema,
    UserListResponseSchema,
} from '@/lib/schemas/admin/users'
import { listUsersService } from '@/services/users/list-users'

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
        const { name, email, phone, role = 'user' } = body

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Nome e email são obrigatórios' },
                { status: 400 }
            )
        }

        const { prisma } = await import('@/lib/db')
        const { auth } = await import('@/server/auth/auth')

        // Check if email already exists
        let user = await prisma.user.findUnique({ where: { email } })

        if (user) {
            return NextResponse.json(
                { error: 'Este e-mail já está cadastrado' },
                { status: 409 }
            )
        }

        const { randomPassword } = await import('@/lib/utils/password')

        // Create user using better-auth (same pattern as enroll)
        await (auth.api.signUpEmail as unknown as (params: { body: Record<string, unknown> }) => Promise<unknown>)({
            body: {
                name,
                email,
                password: randomPassword(), // Use project's password utility
            },
        })

        // Fetch created user
        user = await prisma.user.findUniqueOrThrow({ where: { email } })

        // Update with additional data
        user = await prisma.user.update({
            where: { email },
            data: {
                name,
                phone: phone || null,
                role,
                emailVerified: false,
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error('[POST /api/v1/admin/users]', error)
        return NextResponse.json(
            { error: 'Erro ao criar usuário' },
            { status: 500 }
        )
    }
}

