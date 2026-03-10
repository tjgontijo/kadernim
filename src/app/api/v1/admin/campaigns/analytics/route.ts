import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/services/campaigns/campaign.service';

/**
 * GET /api/v1/admin/campaigns/analytics
 * Retorna métricas agregadas de todas as campanhas
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30d';

        const data = await CampaignService.getAnalytics(period);

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar analytics' },
            { status: 500 }
        );
    }
}
