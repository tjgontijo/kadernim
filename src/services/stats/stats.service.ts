import { prisma } from '@/lib/db'

export class StatsService {
    static async getAdminSummary() {
        const [
            totalResources,
            totalUsers,
            freeResources,
            totalAccessGrants,
            subscribers
        ] = await Promise.all([
            prisma.resource.count(),
            prisma.user.count(),
            prisma.resource.count({ where: { isFree: true } }),
            prisma.resourceUserAccess.count(),
            prisma.user.count({ where: { role: 'subscriber' } })
        ])

        return {
            totalResources,
            totalUsers,
            freeResources,
            paidResources: totalResources - freeResources,
            totalAccessGrants,
            subscribers
        }
    }
}
