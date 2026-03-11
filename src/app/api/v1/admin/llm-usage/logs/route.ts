import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { getLlmUsageLogs } from '@/services/llm/llm-usage-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/llm-usage/logs
 * Retorna log detalhado de chamadas de LLM (paginado)
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Verificar permissão
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const feature = searchParams.get('feature');
        const status = searchParams.get('status');
        const result = await getLlmUsageLogs({ page, limit, feature: feature || undefined, status: status || undefined });

        return NextResponse.json({
            success: true,
            data: {
                logs: result.logs,
                pagination: result.pagination,
            },
        });

    } catch (error) {
        console.error('[GET /api/v1/admin/llm-usage/logs] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao carregar logs de IA' },
            { status: 500 }
        );
    }
}
