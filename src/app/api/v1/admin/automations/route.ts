import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateRuleSchema = z.object({
    name: z.string().min(3, 'Nome muito curto'),
    eventType: z.string().min(1, 'Evento é obrigatório'),
    isActive: z.boolean().default(true),
    description: z.string().optional(),
    conditions: z.any().optional(),
    actions: z.array(z.object({
        type: z.string(),
        config: z.any().default({}),
        order: z.number().optional(),
    })).min(1, 'Pelo menos uma ação é necessária'),
});

/**
 * GET /api/v1/admin/automations
 * Lista todas as regras de automação
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const rules = await prisma.automationRule.findMany({
            include: {
                actions: true,
                _count: { select: { logs: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: rules,
        });
    } catch (error) {
        console.error('[GET /api/v1/admin/automations] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao listar automações' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/admin/automations
 * Cria uma nova regra de automação
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        const data = CreateRuleSchema.parse(body);

        const rule = await prisma.automationRule.create({
            data: {
                name: data.name,
                eventType: data.eventType,
                description: data.description,
                isActive: data.isActive,
                conditions: data.conditions,
                actions: {
                    create: data.actions.map((action, index) => ({
                        type: action.type,
                        config: action.config,
                        order: action.order ?? index,
                    })),
                },
            },
            include: { actions: true },
        });

        return NextResponse.json({
            success: true,
            data: rule,
        });
    } catch (error) {
        console.error('[POST /api/v1/admin/automations] Error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Dados inválidos', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Erro ao criar automação' },
            { status: 500 }
        );
    }
}
