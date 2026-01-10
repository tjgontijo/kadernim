import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/server/auth/middleware';
import { PushTemplateUpdateSchema } from '@/lib/schemas/push-template';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/push-templates/[id]
 * Retorna um push template específico
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    const template = await prisma.pushTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Push template não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error('[API] Erro ao buscar push template:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao buscar push template' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/push-templates/[id]
 * Atualiza um push template existente
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = PushTemplateUpdateSchema.safeParse(body);

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
    const existing = await prisma.pushTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Push template não encontrado' },
        { status: 404 }
      );
    }

    // Se está atualizando o slug, verificar duplicidade
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await prisma.pushTemplate.findUnique({
        where: { slug: parsed.data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Já existe um push template com este slug' },
          { status: 409 }
        );
      }
    }

    const template = await prisma.pushTemplate.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error('[API] Erro ao atualizar push template:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao atualizar push template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/push-templates/[id]
 * Remove um push template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    // Verificar se template existe
    const existing = await prisma.pushTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Push template não encontrado' },
        { status: 404 }
      );
    }

    await prisma.pushTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Push template excluído com sucesso',
    });
  } catch (error) {
    console.error('[API] Erro ao excluir push template:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao excluir push template' },
      { status: 500 }
    );
  }
}
