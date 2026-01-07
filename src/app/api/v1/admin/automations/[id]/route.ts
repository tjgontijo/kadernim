import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpdateRuleSchema = z.object({
    name: z.string().min(3).optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
    eventType: z.string().optional(),
    conditions: z.any().optional(),
    actions: z.array(z.object({
        type: z.string(),
        config: z.any().default({}),
        order: z.number().optional(),
    })).optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/automations/[id]
 * Busca uma regra específica
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;

        const rule = await prisma.automationRule.findUnique({
            where: { id },
            include: {
                actions: { orderBy: { order: 'asc' } },
                logs: {
                    orderBy: { executedAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!rule) {
            return NextResponse.json(
                { success: false, error: 'Automação não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rule,
        });
    } catch (error) {
        console.error('[GET /api/v1/admin/automations/[id]] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar automação' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/v1/admin/automations/[id]
 * Atualiza uma regra (toggle on/off, editar nome, etc)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;
        const body = await request.json();
        const data = UpdateRuleSchema.parse(body);

        const rule = await prisma.automationRule.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.eventType !== undefined && { eventType: data.eventType }),
                ...(data.conditions !== undefined && { conditions: data.conditions }),
                ...(data.actions !== undefined && {
                    actions: {
                        deleteMany: {},
                        create: data.actions.map((action, index) => ({
                            type: action.type,
                            config: action.config,
                            order: action.order ?? index,
                        })),
                    },
                }),
            },
            include: { actions: true },
        });

        return NextResponse.json({
            success: true,
            data: rule,
        });
    } catch (error) {
        console.error('[PATCH /api/v1/admin/automations/[id]] Error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Dados inválidos', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Erro ao atualizar automação' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/v1/admin/automations/[id]
 * Remove uma regra e suas ações (cascade)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;

        // Verifica se existe
        const existing = await prisma.automationRule.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Automação não encontrada' },
                { status: 404 }
            );
        }

        // Deletar logs primeiro (não tem cascade)
        await prisma.automationLog.deleteMany({ where: { ruleId: id } });

        // Deletar actions (cascade deveria funcionar, mas por segurança)
        await prisma.automationAction.deleteMany({ where: { ruleId: id } });

        // Agora deleta a regra
        await prisma.automationRule.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Automação excluída com sucesso',
        });
    } catch (error) {
        console.error('[DELETE /api/v1/admin/automations/[id]] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao excluir automação' },
            { status: 500 }
        );
    }
}
