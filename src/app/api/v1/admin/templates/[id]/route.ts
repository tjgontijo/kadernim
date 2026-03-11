import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { NotificationTemplateService } from '@/services/templates/notification-template.service'
import { NotificationTemplateUpdateSchema } from '@/schemas/templates/notification-template-schemas'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/templates/[id]
 * Retorna um template específico
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const template = await NotificationTemplateService.getById(id)

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('[API] Erro ao buscar template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao buscar template' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/v1/admin/templates/[id]
 * Atualiza um template existente
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const body = await request.json()
    const parsed = NotificationTemplateUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await NotificationTemplateService.getById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugConflict = await NotificationTemplateService.getBySlug(parsed.data.slug)
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'Já existe um template com este slug' },
          { status: 409 }
        )
      }
    }

    const template = await NotificationTemplateService.update(id, parsed.data)
    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('[API] Erro ao atualizar template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao atualizar template' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/admin/templates/[id]
 * Remove um template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const existing = await NotificationTemplateService.getById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    await NotificationTemplateService.delete(id)
    return NextResponse.json({ success: true, message: 'Template excluído com sucesso' })
  } catch (error) {
    console.error('[API] Erro ao excluir template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao excluir template' },
      { status: 500 }
    )
  }
}
