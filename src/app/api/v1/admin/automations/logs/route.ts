import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { prisma } from '@/lib/db';

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
        const ruleId = searchParams.get('ruleId');
        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        const where = {
            ...(ruleId && { ruleId }),
            ...(status && { status }),
        };

        const [logs, total] = await Promise.all([
            prisma.automationLog.findMany({
                where,
                include: {
                    rule: { select: { name: true, eventType: true } },
                    action: { select: { type: true } },
                },
                orderBy: { executedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.automationLog.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('[GET /api/v1/admin/automations/logs] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao listar logs de automação' },
            { status: 500 }
        );
    }
}
