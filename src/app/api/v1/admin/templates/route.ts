import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/server/auth/middleware';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createTemplateSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
    name: z.string().min(1),
    type: z.enum(['email', 'whatsapp', 'push', 'slack']),
    eventType: z.string().min(1), // Ex: 'user.login', 'resource.purchased'
    subject: z.string().nullable().optional(),
    body: z.string().min(1),
    description: z.string().nullable().optional(),
    variables: z.array(z.string()).nullable().optional(),
});

/**
 * GET /api/v1/admin/templates
 * Lista todos os templates de notificação
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const templates = await prisma.notificationTemplate.findMany({
            orderBy: [
                { type: 'asc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        console.error('[API] Erro ao listar templates:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao listar templates' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/admin/templates
 * Cria um novo template de notificação
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        const parsed = createTemplateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { slug, name, type, eventType, subject, body: bodyContent, description, variables } = parsed.data;

        // Verificar se slug já existe
        const existing = await prisma.notificationTemplate.findUnique({
            where: { slug },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Já existe um template com este slug' },
                { status: 409 }
            );
        }

        const template = await prisma.notificationTemplate.create({
            data: {
                slug,
                name,
                type,
                eventType,
                subject,
                body: bodyContent,
                description,
                variables: variables ?? undefined,
            },
        });

        return NextResponse.json({ success: true, data: template }, { status: 201 });
    } catch (error) {
        console.error('[API] Erro ao criar template:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao criar template' },
            { status: 500 }
        );
    }
}
