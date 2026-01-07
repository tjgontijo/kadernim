import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/server/auth/middleware';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateTemplateSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
    name: z.string().min(1).optional(),
    type: z.enum(['email', 'whatsapp', 'push', 'slack']).optional(),
    eventType: z.string().min(1).optional(),
    subject: z.string().nullable().optional(),
    body: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    variables: z.array(z.string()).nullable().optional(),
    isActive: z.boolean().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/templates/[id]
 * Retorna um template específico
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;

        const template = await prisma.notificationTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Template não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('[API] Erro ao buscar template:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao buscar template' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/v1/admin/templates/[id]
 * Atualiza um template existente
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;
        const body = await request.json();
        const parsed = updateTemplateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Verificar se template existe
        const existing = await prisma.notificationTemplate.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Template não encontrado' },
                { status: 404 }
            );
        }

        // Se está atualizando o slug, verificar duplicidade
        if (parsed.data.slug && parsed.data.slug !== existing.slug) {
            const slugExists = await prisma.notificationTemplate.findUnique({
                where: { slug: parsed.data.slug },
            });

            if (slugExists) {
                return NextResponse.json(
                    { success: false, error: 'Já existe um template com este slug' },
                    { status: 409 }
                );
            }
        }

        // Preparar dados para update (tratar variables null)
        const updateData: Record<string, unknown> = { ...parsed.data };
        if (parsed.data.variables === null) {
            updateData.variables = null;
        }

        const template = await prisma.notificationTemplate.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('[API] Erro ao atualizar template:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao atualizar template' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/v1/admin/templates/[id]
 * Remove um template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;

        // Verificar se template existe
        const existing = await prisma.notificationTemplate.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Template não encontrado' },
                { status: 404 }
            );
        }

        await prisma.notificationTemplate.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Template excluído com sucesso' });
    } catch (error) {
        console.error('[API] Erro ao excluir template:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao excluir template' },
            { status: 500 }
        );
    }
}
