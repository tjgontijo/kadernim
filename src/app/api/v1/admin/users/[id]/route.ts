import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { UpdateUserSchema } from '@/lib/schemas/admin/users'
import { updateUserService, deleteUserService } from '@/services/users/update-user'

/**
 * PATCH /api/v1/admin/users/[id]
 * Update a user
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params

        // Require manage users permission
        const authResult = await requirePermission(request, 'manage:users')
        if (authResult instanceof NextResponse) {
            return authResult
        }

        const { userId: adminId } = authResult

        // Rate limiting: 30 requests per minute per admin
        const rl = checkRateLimit(`admin:users:update:${adminId}`, {
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
        const parsed = UpdateUserSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    issues: parsed.error.format(),
                },
                { status: 400 }
            )
        }

        // Security check: Don't allow admin to ban themselves or change their own role
        if (targetUserId === adminId) {
            if (parsed.data.banned !== undefined || parsed.data.role !== undefined) {
                return NextResponse.json(
                    { error: 'Você não pode alterar seu próprio cargo ou status de banimento.' },
                    { status: 403 }
                )
            }
        }

        // Update user
        const updatedUser = await updateUserService(targetUserId, parsed.data)

        return NextResponse.json({
            ...updatedUser,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
            subscription: updatedUser.subscription ? {
                ...updatedUser.subscription,
                expiresAt: updatedUser.subscription.expiresAt ? updatedUser.subscription.expiresAt.toISOString() : null,
            } : null,
        })
    } catch (error) {
        console.error('[PATCH /api/v1/admin/users/[id]]', error)
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/v1/admin/users/[id]
 * Delete a user
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params

        // Require delete users permission
        const authResult = await requirePermission(request, 'delete:users')
        if (authResult instanceof NextResponse) {
            return authResult
        }

        const { userId: adminId } = authResult

        // Prevent admin from deleting themselves
        if (targetUserId === adminId) {
            return NextResponse.json(
                { error: 'Você não pode deletar sua própria conta.' },
                { status: 403 }
            )
        }

        // Rate limiting: 10 requests per minute per admin
        const rl = checkRateLimit(`admin:users:delete:${adminId}`, {
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

        // Delete user
        await deleteUserService(targetUserId)

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[DELETE /api/v1/admin/users/[id]]', error)
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
