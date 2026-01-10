import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/server/auth/middleware';
import { EmailTemplateUpdateSchema } from '@/lib/schemas/email-template';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/email-templates/[id]
 * Retorna um email template específico
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;

        const template = await prisma.emailTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Email template não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('[API] Erro ao buscar email template:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao buscar email template' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/v1/admin/email-templates/[id]
 * Atualiza um email template existente
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;
        const body = await request.json();
        const parsed = EmailTemplateUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Dados inválidos',
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        // Verificar se template existe
        const existing = await prisma.emailTemplate.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Email template não encontrado' },
                { status: 404 }
            );
        }

        // Se está atualizando o slug, verificar duplicidade
        if (parsed.data.slug && parsed.data.slug !== existing.slug) {
            const slugExists = await prisma.emailTemplate.findUnique({
                where: { slug: parsed.data.slug },
            });

            if (slugExists) {
                return NextResponse.json(
                    { success: false, error: 'Já existe um template com este slug' },
                    { status: 409 }
                );
            }
        }

        const template = await prisma.emailTemplate.update({
            where: { id },
            data: parsed.data,
        });

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('[API] Erro ao atualizar email template:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao atualizar email template' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/v1/admin/email-templates/[id]
 * Remove um email template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;

        // Verificar se template existe
        const existing = await prisma.emailTemplate.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Email template não encontrado' },
                { status: 404 }
            );
        }

        await prisma.emailTemplate.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Email template excluído com sucesso',
        });
    } catch (error) {
        console.error('[API] Erro ao excluir email template:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao excluir email template' },
            { status: 500 }
        );
    }
}
