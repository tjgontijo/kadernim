import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { WhatsAppTemplateUpdateSchema } from '@/schemas/templates/whatsapp-template-schemas'
import { WhatsAppTemplateService } from '@/services/templates/whatsapp-template.service'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/whatsapp-templates/[id]
 * Retorna um whatsapp template específico
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const template = await WhatsAppTemplateService.getById(id)

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp template não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('[API] Erro ao buscar whatsapp template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao buscar whatsapp template' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/v1/admin/whatsapp-templates/[id]
 * Atualiza um whatsapp template existente
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const body = await request.json()
    const parsed = WhatsAppTemplateUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const existing = await WhatsAppTemplateService.getById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp template não encontrado' },
        { status: 404 }
      )
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await WhatsAppTemplateService.getBySlug(parsed.data.slug)
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Já existe um template com este slug' },
          { status: 409 }
        )
      }
    }

    const template = await WhatsAppTemplateService.update(id, parsed.data)
    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('[API] Erro ao atualizar whatsapp template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao atualizar whatsapp template' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/admin/whatsapp-templates/[id]
 * Remove um whatsapp template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const existing = await WhatsAppTemplateService.getById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp template não encontrado' },
        { status: 404 }
      )
    }

    await WhatsAppTemplateService.delete(id)
    return NextResponse.json({
      success: true,
      message: 'WhatsApp template excluído com sucesso',
    })
  } catch (error) {
    console.error('[API] Erro ao excluir whatsapp template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao excluir whatsapp template' },
      { status: 500 }
    )
  }
}
