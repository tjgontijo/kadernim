import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import {
  PushTemplateCreateSchema,
  PushTemplateListSchema,
} from '@/schemas/templates/push-template-schemas'
import { PushTemplateService } from '@/services/templates/push-template.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/admin/push-templates
 * Lista todos os templates de push notification
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const filters = PushTemplateListSchema.safeParse({
      eventType: searchParams.get('eventType') || undefined,
      isActive:
        searchParams.get('isActive') === 'true'
          ? true
          : searchParams.get('isActive') === 'false'
            ? false
            : undefined,
      search: searchParams.get('search') || undefined,
    })

    const templates = await PushTemplateService.list(
      filters.success ? filters.data : {}
    )

    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    console.error('[API] Erro ao listar push templates:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao listar push templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/push-templates
 * Cria um novo template de push notification
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const parsed = PushTemplateCreateSchema.safeParse(body)

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

    const slug = PushTemplateService.resolveSlug(parsed.data.name, parsed.data.slug)
    const existing = await PushTemplateService.getBySlug(slug)
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Já existe um template com este slug' },
        { status: 409 }
      )
    }

    const template = await PushTemplateService.create({
      ...parsed.data,
      slug,
    })

    return NextResponse.json({ success: true, data: template }, { status: 201 })
  } catch (error) {
    console.error('[API] Erro ao criar push template:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno ao criar push template' },
      { status: 500 }
    )
  }
}
