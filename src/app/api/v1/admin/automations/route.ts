import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { AutomationService } from '@/services/automations/automation.service';
import { AutomationRuleSchema } from '@/schemas/automations/automation-schemas';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

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

        const rules = await AutomationService.list();

        return NextResponse.json({
            success: true,
            data: rules,
        });
    } catch (error) {
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
        const validated = AutomationRuleSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { success: false, error: 'Dados inválidos', details: validated.error.issues },
                { status: 400 }
            );
        }

        const rule = await AutomationService.create(validated.data);

        return NextResponse.json({
            success: true,
            data: rule,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro ao criar automação' },
            { status: 500 }
        );
    }
}
