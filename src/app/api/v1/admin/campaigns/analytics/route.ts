import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { subDays, format } from 'date-fns';

/**
 * GET /api/v1/admin/campaigns/analytics
 * Retorna métricas agregadas de todas as campanhas
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30d';

        // Calcular data inicial baseado no período
        const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap[period] || 30;
        const startDate = subDays(new Date(), days);

        // KPIs Globais
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
        ]);

        const totalSent = totalStats._sum.totalSent || 0;
        const totalClicked = totalStats._sum.totalClicked || 0;
        const ctr = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

        // Top Campanha (melhor CTR)
        const topCampaign = await prisma.pushCampaign.findFirst({
            where: {
                status: 'SENT',
                totalSent: { gt: 0 },
                sentAt: { gte: startDate },
            },
            orderBy: [
                // Ordenar por CTR (calculado no banco não é possível, então pegamos a primeira)
                { totalClicked: 'desc' },
            ],
            select: {
                id: true,
                title: true,
                totalSent: true,
                totalClicked: true,
            },
        });

        // Dados diários para gráfico
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
        `;

        // Ranking de campanhas
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
        });

        const campaignRanking = campaigns.map((c) => ({
            ...c,
            ctr: c.totalSent > 0 ? ((c.totalClicked / c.totalSent) * 100).toFixed(2) : '0.00',
        }));

        // Métricas de usuários únicos (NEW with userId tracking)
        const uniqueUsersClicked = await prisma.pushCampaignClick.groupBy({
            by: ['userId'],
            where: {
                clickedAt: { gte: startDate },
                userId: { not: null },
            },
            _count: {
                userId: true,
            },
        });

        const totalUniqueUsersClicked = uniqueUsersClicked.length;

        // Contar usuários únicos que receberam notificações (usuários com push subscriptions ativas)
        const totalUsersWithPush = await prisma.user.count({
            where: {
                pushSubscriptions: {
                    some: {
                        active: true,
                    },
                },
            },
        });

        // Top usuários engajados (maior número de cliques)
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
        `;

        return NextResponse.json({
            success: true,
            data: {
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
                    // NEW: User-based metrics
                    totalUsersWithPush,
                    uniqueUsersClicked: totalUniqueUsersClicked,
                    userEngagementRate: totalUsersWithPush > 0
                        ? ((totalUniqueUsersClicked / totalUsersWithPush) * 100).toFixed(2)
                        : '0.00',
                },
                daily: dailyData.map((d) => ({
                    date: format(new Date(d.date), 'yyyy-MM-dd'),
                    sent: Number(d.sent),
                    clicked: Number(d.clicked),
                })),
                campaigns: campaignRanking,
                // NEW: Top engaged users
                topEngagedUsers: topEngagedUsers.map((u) => ({
                    userId: u.userId,
                    userName: u.userName,
                    clickCount: u.clickCount,
                })),
            },
        });
    } catch (error) {
        console.error('[Analytics API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar analytics' },
            { status: 500 }
        );
    }
}
