import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { NotificationTemplateCreateSchema } from '@/schemas/templates/notification-template-schemas'
import { NotificationTemplateService } from '@/services/templates/notification-template.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/admin/templates
 * Lista todos os templates de notificação (Email, Push, WhatsApp)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const templates = await NotificationTemplateService.listAllUnified()

    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    console.error('[API] Erro ao listar templates:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao listar templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/templates
 * Cria um novo template de notificação
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const parsed = NotificationTemplateCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await NotificationTemplateService.getBySlug(parsed.data.slug)
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Já existe um template com este slug' },
        { status: 409 }
      )
    }

    const template = await NotificationTemplateService.create(parsed.data)

    return NextResponse.json({ success: true, data: template }, { status: 201 })
  } catch (error) {
    console.error('[API] Erro ao criar template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao criar template' },
      { status: 500 }
    )
  }
}
