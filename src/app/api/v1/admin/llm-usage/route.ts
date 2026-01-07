import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { getLlmUsageByPeriod, getDailyUsage, checkCostAlerts } from '@/services/llm/llm-usage-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/llm-usage
 * Retorna estatísticas de uso de LLM para o dashboard admin
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Verificar permissão (apenas admin/manage:resources)
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30d';

        // Calcular datas
        const endDate = new Date();
        const startDate = new Date();
        if (period === '7d') startDate.setDate(endDate.getDate() - 7);
        else if (period === '90d') startDate.setDate(endDate.getDate() - 90);
        else startDate.setDate(endDate.getDate() - 30); // 30d default

        // 2. Buscar dados do service
        const usage = await getLlmUsageByPeriod({ startDate, endDate });
        const daily = await getDailyUsage(period === '7d' ? 7 : period === '90d' ? 90 : 30);
        const alerts = await checkCostAlerts();

        return NextResponse.json({
            success: true,
            data: {
                totals: usage.totals,
                byFeature: usage.byFeature,
                byModel: usage.byModel,
                daily,
                alerts: alerts ? {
                    level: alerts.level,
                    cost: alerts.cost,
                    message: alerts.message
                } : { level: 'ok' }
            }
        });

    } catch (error) {
        console.error('[GET /api/v1/admin/llm-usage] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao carregar estatísticas de IA' },
            { status: 500 }
        );
    }
}
