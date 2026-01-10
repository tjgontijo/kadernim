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
                name: true,
                totalSent: true,
                totalClicked: true,
            },
        });

        // Dados diários para gráfico
        const dailyData = await prisma.$queryRaw<
            Array<{ date: string; sent: number; clicked: number }>
        >`
            SELECT 
                DATE(sent_at) as date,
                SUM(total_sent) as sent,
                SUM(total_clicked) as clicked
            FROM push_campaigns
            WHERE sent_at >= ${startDate}
            AND status = 'SENT'
            GROUP BY DATE(sent_at)
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
                name: true,
                totalSent: true,
                totalClicked: true,
                sentAt: true,
            },
            orderBy: { sentAt: 'desc' },
            take: 10,
        });

        const campaignRanking = campaigns.map((c) => ({
            ...c,
            ctr: c.totalSent > 0 ? ((c.totalClicked / c.totalSent) * 100).toFixed(2) : '0.00',
        }));

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
                },
                daily: dailyData.map((d) => ({
                    date: format(new Date(d.date), 'yyyy-MM-dd'),
                    sent: Number(d.sent),
                    clicked: Number(d.clicked),
                })),
                campaigns: campaignRanking,
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
