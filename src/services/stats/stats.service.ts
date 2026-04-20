import { prisma } from '@/lib/db'

export class StatsService {
    static async getAdminSummary() {
        const [
            totalResources,
            totalUsers,
            totalSubjects,
            activeSubscriptions,
            subscribers
        ] = await Promise.all([
            prisma.resource.count(),
            prisma.user.count(),
            prisma.subject.count(),
            prisma.subscription.count({ where: { isActive: true } }),
            prisma.user.count({ where: { role: 'subscriber' } })
        ])

        return {
            totalResources,
            totalUsers,
            totalSubjects,
            activeSubscriptions,
            subscribers
        }
    }
}
