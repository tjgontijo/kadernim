import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/server/auth/middleware';
import { EmailTemplateService } from '@/services/templates/email-template.service';
import {
    EmailTemplateCreateSchema,
    EmailTemplateListSchema,
} from '@/schemas/templates/email-template-schemas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/email-templates
 * Lista todos os templates de email
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const filters = EmailTemplateListSchema.safeParse({
            eventType: searchParams.get('eventType') || undefined,
            isActive:
                searchParams.get('isActive') === 'true'
                    ? true
                    : searchParams.get('isActive') === 'false'
                        ? false
                        : undefined,
            search: searchParams.get('search') || undefined,
        });

        const templates = await EmailTemplateService.list(filters.success ? filters.data : {});

        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro interno ao listar email templates' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/admin/email-templates
 * Cria um novo template de email
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources');
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        const parsed = EmailTemplateCreateSchema.safeParse(body);

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

        const existing = await EmailTemplateService.getBySlug(parsed.data.slug);
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Já existe um template com este slug' },
                { status: 409 }
            );
        }

        const template = await EmailTemplateService.create(parsed.data);

        return NextResponse.json({ success: true, data: template }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro interno ao criar email template' },
            { status: 500 }
        );
    }
}
