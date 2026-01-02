import { prisma } from '@/lib/db'

/**
 * Get all resources with a flag indicating if the user has access
 */
export async function getUserResourceAccessService(userId: string) {
    // Get all resources
    const allResources = await prisma.resource.findMany({
        select: {
            id: true,
            title: true,
            isFree: true,
            educationLevel: { select: { name: true } },
            subject: { select: { name: true } },
        },
        orderBy: { title: 'asc' }
    })

    // Get resources the user has access to
    const userAccess = await prisma.resourceUserAccess.findMany({
        where: { userId },
        select: { resourceId: true }
    })

    const accessSet = new Set(userAccess.map(a => a.resourceId))

    const resources = allResources.map(r => ({
        id: r.id,
        title: r.title,
        isFree: r.isFree,
        educationLevel: r.educationLevel.name,
        subject: r.subject.name,
        hasAccess: accessSet.has(r.id)
    }))

    // Sort: Has access first, then by title
    return resources.sort((a, b) => {
        if (a.hasAccess === b.hasAccess) return a.title.localeCompare(b.title)
        return a.hasAccess ? -1 : 1
    })
}

/**
 * Toggle access for a user to a specific resource
 */
export async function toggleUserResourceAccessService(userId: string, resourceId: string, hasAccess: boolean) {
    if (hasAccess) {
        // Grant access
        return await prisma.resourceUserAccess.upsert({
            where: {
                userId_resourceId: { userId, resourceId }
            },
            create: {
                userId,
                resourceId,
                source: 'admin_manual'
            },
            update: {}
        })
    } else {
        // Revoke access
        return await prisma.resourceUserAccess.deleteMany({
            where: { userId, resourceId }
        })
    }
}
