import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { AutomationService } from '@/services/automations/automation.service';
import { UpdateAutomationRuleSchema } from '@/schemas/automations/automation-schemas';

export const dynamic = 'force-dynamic';

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
        const rule = await AutomationService.getById(id);

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
        const validated = UpdateAutomationRuleSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { success: false, error: 'Dados inválidos', details: validated.error.issues },
                { status: 400 }
            );
        }

        const rule = await AutomationService.update(id, validated.data);

        return NextResponse.json({
            success: true,
            data: rule,
        });
    } catch (error) {
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
        await AutomationService.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Automação excluída com sucesso',
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro ao excluir automação' },
            { status: 500 }
        );
    }
}
