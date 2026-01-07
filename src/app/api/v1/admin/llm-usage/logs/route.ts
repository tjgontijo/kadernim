import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { prisma } from '@/lib/db';

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
        const skip = (page - 1) * limit;

        // 2. Buscar logs com filtro
        const where = {
            ...(feature && { feature }),
            ...(status && { status }),
        };

        const [logs, total] = await Promise.all([
            prisma.llmUsageLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.llmUsageLog.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
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
