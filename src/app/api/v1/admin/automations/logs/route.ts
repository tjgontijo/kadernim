import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { AutomationService } from '@/services/automations/automation.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/automations/logs
 * Lista logs de execução de automações
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const page = parseInt(searchParams.get('page') || '1');
        const ruleId = searchParams.get('ruleId') || undefined;

        const result = await AutomationService.getLogs({ page, limit, ruleId });

        return NextResponse.json({
            success: true,
            data: result.logs,
            pagination: result.pagination,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro ao listar logs de automação' },
            { status: 500 }
        );
    }
}
