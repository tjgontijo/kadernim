import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/server/auth/middleware';
import {
  PushTemplateCreateSchema,
  PushTemplateListSchema,
} from '@/lib/schemas/push-template';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/push-templates
 * Lista todos os templates de push notification
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, 'manage:resources');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const filters = PushTemplateListSchema.safeParse({
      eventType: searchParams.get('eventType') || undefined,
      isActive:
        searchParams.get('isActive') === 'true'
          ? true
          : searchParams.get('isActive') === 'false'
            ? false
            : undefined,
      search: searchParams.get('search') || undefined,
    });

    const where: Record<string, unknown> = {};

    if (filters.success) {
      if (filters.data.eventType) {
        where.eventType = filters.data.eventType;
      }
      if (typeof filters.data.isActive === 'boolean') {
        where.isActive = filters.data.isActive;
      }
      if (filters.data.search) {
        where.OR = [
          { title: { contains: filters.data.search, mode: 'insensitive' } },
          { slug: { contains: filters.data.search, mode: 'insensitive' } },
          {
            description: { contains: filters.data.search, mode: 'insensitive' },
          },
        ];
      }
    }

    const templates = await prisma.pushTemplate.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { title: 'asc' }],
    });

    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error('[API] Erro ao listar push templates:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao listar push templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/push-templates
 * Cria um novo template de push notification
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, 'manage:resources');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const parsed = PushTemplateCreateSchema.safeParse(body);

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

    let { slug, name, ...rest } = parsed.data;

    // Gerar slug automaticamente se não fornecido
    if (!slug) {
      slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Verificar se slug já existe
    const existing = await prisma.pushTemplate.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Já existe um template com este slug' },
        { status: 409 }
      );
    }

    const template = await prisma.pushTemplate.create({
      data: {
        slug,
        name,
        ...rest,
      },
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error) {
    console.error('[API] Erro ao criar push template:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao criar push template' },
      { status: 500 }
    );
  }
}
