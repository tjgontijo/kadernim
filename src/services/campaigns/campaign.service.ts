import { prisma } from '@/lib/db'
import { emitEvent } from '@/lib/inngest'
import type { CampaignInput } from '@/schemas/campaigns/campaign-schemas'

export class CampaignService {
    static async list(params: { page?: number; limit?: number; status?: string }) {
        const page = params.page || 1
        const limit = params.limit || 15
        const status = params.status

        const where = status ? { status: status as any } : {}

        const [campaigns, total] = await Promise.all([
            prisma.pushCampaign.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.pushCampaign.count({ where }),
        ])

        return {
            campaigns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    static async create(data: CampaignInput) {
        const campaign = await prisma.pushCampaign.create({
            data: {
                title: data.title,
                body: data.body,
                url: data.url,
                icon: data.icon,
                imageUrl: data.imageUrl,
                audience: (data.audience as any) || {},
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
            },
        })

        if (campaign.scheduledAt) {
            await emitEvent('campaign.scheduled', {
                campaignId: campaign.id,
                scheduledAt: campaign.scheduledAt.toISOString(),
            })
        }

        return campaign
    }

    static async getById(id: string) {
        return prisma.pushCampaign.findUnique({
            where: { id },
        })
    }

    static async update(id: string, data: Partial<CampaignInput> & { status?: string }) {
        const campaign = await prisma.pushCampaign.update({
            where: { id },
            data: {
                ...data,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            } as any,
        })

        return campaign
    }

    static async delete(id: string) {
        return prisma.pushCampaign.delete({
            where: { id },
        })
    }

    static async getAnalytics(period: string = '30d') {
        const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
        const days = daysMap[period] || 30
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const [totalCampaigns, sentCampaigns, totalStats] = await Promise.all([
            prisma.pushCampaign.count(),
            prisma.pushCampaign.count({ where: { status: 'SENT' } }),
            prisma.pushCampaign.aggregate({
                where: { sentAt: { gte: startDate } },
                _sum: {
                    totalSent: true,
                    totalClicked: true,
                },
            }),
        ])

        const totalSent = totalStats._sum.totalSent || 0
        const totalClicked = totalStats._sum.totalClicked || 0
        const ctr = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0

        const topCampaign = await prisma.pushCampaign.findFirst({
            where: {
                status: 'SENT',
                totalSent: { gt: 0 },
                sentAt: { gte: startDate },
            },
            orderBy: { totalClicked: 'desc' },
            select: {
                id: true,
                title: true,
                totalSent: true,
                totalClicked: true,
            },
        })

        const dailyData = await prisma.$queryRaw<
            Array<{ date: string; sent: number; clicked: number }>
        >`
            SELECT 
                DATE("sentAt") as date,
                SUM("totalSent") as sent,
                SUM("totalClicked") as clicked
            FROM push_campaigns
            WHERE "sentAt" >= ${startDate}
            AND status = 'SENT'
            GROUP BY DATE("sentAt")
            ORDER BY date ASC
        `

        const campaigns = await prisma.pushCampaign.findMany({
            where: {
                status: 'SENT',
                sentAt: { gte: startDate },
            },
            select: {
                id: true,
                title: true,
                totalSent: true,
                totalClicked: true,
                sentAt: true,
                audience: true,
            },
            orderBy: { sentAt: 'desc' },
            take: 10,
        })

        const campaignRanking = campaigns.map((c) => ({
            ...c,
            ctr: c.totalSent > 0 ? ((c.totalClicked / c.totalSent) * 100).toFixed(2) : '0.00',
        }))

        const uniqueUsersClicked = await prisma.pushCampaignClick.groupBy({
            by: ['userId'],
            where: {
                clickedAt: { gte: startDate },
                userId: { not: null },
            },
            _count: {
                userId: true,
            },
        })

        const totalUniqueUsersClicked = uniqueUsersClicked.length

        const totalUsersWithPush = await prisma.user.count({
            where: {
                pushSubscriptions: {
                    some: {
                        active: true,
                    },
                },
            },
        })

        const topEngagedUsers = await prisma.$queryRaw<
            Array<{ userId: string; userName: string; clickCount: number }>
        >`
            SELECT
                pcc."userId" as "userId",
                u.name as "userName",
                COUNT(*)::int as "clickCount"
            FROM push_campaign_clicks pcc
            INNER JOIN "user" u ON u.id = pcc."userId"
            WHERE pcc."clickedAt" >= ${startDate}
            AND pcc."userId" IS NOT NULL
            GROUP BY pcc."userId", u.name
            ORDER BY "clickCount" DESC
            LIMIT 5
        `

        return {
            kpis: {
                totalCampaigns,
                sentCampaigns,
                totalSent,
                totalClicked,
                ctr: ctr.toFixed(2),
                topCampaign: topCampaign
                    ? {
                        ...topCampaign,
                        ctr:
                            topCampaign.totalSent > 0
                                ? (
                                    (topCampaign.totalClicked / topCampaign.totalSent) *
                                    100
                                ).toFixed(2)
                                : '0.00',
                    }
                    : null,
                totalUsersWithPush,
                uniqueUsersClicked: totalUniqueUsersClicked,
                userEngagementRate: totalUsersWithPush > 0
                    ? ((totalUniqueUsersClicked / totalUsersWithPush) * 100).toFixed(2)
                    : '0.00',
            },
            daily: dailyData.map((d) => ({
                date: new Date(d.date).toISOString().split('T')[0],
                sent: Number(d.sent),
                clicked: Number(d.clicked),
            })),
            campaigns: campaignRanking,
            topEngagedUsers: topEngagedUsers.map((u) => ({
                userId: u.userId,
                userName: u.userName,
                clickCount: u.clickCount,
            })),
        }
    }
}
