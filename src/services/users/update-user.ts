import { prisma } from '@/lib/db'
import { UpdateUserInput } from '@/lib/schemas/admin/users'

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
