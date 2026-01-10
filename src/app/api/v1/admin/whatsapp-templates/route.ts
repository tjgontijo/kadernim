import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/server/auth/middleware';
import {
    WhatsAppTemplateCreateSchema,
    WhatsAppTemplateListSchema,
} from '@/lib/schemas/whatsapp-template';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/whatsapp-templates
 * Lista todos os templates de WhatsApp
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const filters = WhatsAppTemplateListSchema.safeParse({
            eventType: searchParams.get('eventType') || undefined,
            isActive:
                searchParams.get('isActive') === 'true'
                    ? true
                    : searchParams.get('isActive') === 'false'
                        ? false
                        : undefined,
            search: searchParams.get('search') || undefined,
        });

        const where: any = {};

        if (filters.success) {
            if (filters.data.eventType) {
                where.eventType = filters.data.eventType;
            }
            if (typeof filters.data.isActive === 'boolean') {
                where.isActive = filters.data.isActive;
            }
            if (filters.data.search) {
                where.OR = [
                    { name: { contains: filters.data.search, mode: 'insensitive' } },
                    { body: { contains: filters.data.search, mode: 'insensitive' } },
                    { slug: { contains: filters.data.search, mode: 'insensitive' } },
                ];
            }
        }

        const templates = await prisma.whatsAppTemplate.findMany({
            where,
            orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        });

        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        console.error('[API] Erro ao listar whatsapp templates:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao listar whatsapp templates' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/admin/whatsapp-templates
 * Cria um novo template de WhatsApp
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        const parsed = WhatsAppTemplateCreateSchema.safeParse(body);

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

        const { slug, ...rest } = parsed.data;

        // Verificar se slug já existe
        const existing = await prisma.whatsAppTemplate.findUnique({
            where: { slug },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Já existe um template com este slug' },
                { status: 409 }
            );
        }

        const template = await prisma.whatsAppTemplate.create({
            data: {
                slug,
                ...rest,
            },
        });

        return NextResponse.json({ success: true, data: template }, { status: 201 });
    } catch (error) {
        console.error('[API] Erro ao criar whatsapp template:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao criar whatsapp template' },
            { status: 500 }
        );
    }
}
