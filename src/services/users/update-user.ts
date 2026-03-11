import { prisma } from '@/lib/db'
import { auth } from '@/server/auth/auth'
import { randomPassword } from '@/lib/utils/password'
import { CreateAdminUserInput, UpdateUserInput } from '@/schemas/users/admin-user-schemas'

/**
 * Update a user's basic info, role, or banned status
 */
export async function updateUserService(userId: string, data: UpdateUserInput) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            banned: data.banned,
        },
        include: {
            subscription: {
                select: {
                    isActive: true,
                    expiresAt: true,
                },
            },
            _count: {
                select: {
                    resourceAccesses: true,
                },
            },
        },
    })

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        banned: user.banned,
        subscription: user.subscription,
        resourceAccessCount: user._count.resourceAccesses,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

export async function createAdminUserService(data: CreateAdminUserInput) {
    let user = await prisma.user.findUnique({ where: { email: data.email } })

    if (user) {
        throw new Error('USER_EMAIL_EXISTS')
    }

    await (auth.api.signUpEmail as unknown as (params: { body: Record<string, unknown> }) => Promise<unknown>)({
        body: {
            name: data.name,
            email: data.email,
            password: randomPassword(),
        },
    })

    user = await prisma.user.findUniqueOrThrow({ where: { email: data.email } })

    return prisma.user.update({
        where: { email: data.email },
        data: {
            name: data.name,
            phone: data.phone || null,
            role: data.role,
            emailVerified: false,
        },
    })
}

export async function updateUserAvatarService(userId: string, imageUrl: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    })

    if (!user) {
        throw new Error('USER_NOT_FOUND')
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            image: imageUrl,
        },
    })
}

/**
 * Delete a user from the database
 */
export async function deleteUserService(userId: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user) {
        throw new Error('Usuário não encontrado')
    }

    // Delete user (Prisma will handle relations based on onDelete: Cascade)
    await prisma.user.delete({
        where: { id: userId },
    })

    return { success: true }
}
