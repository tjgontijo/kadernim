import { NextRequest, NextResponse } from 'next/server'
import { ZodType } from 'zod'
import { requirePermission } from '@/server/auth/middleware'

export type TemplateLookupService<T> = {
  getById: (id: string) => Promise<T | null>
  getBySlug?: (slug: string) => Promise<T | null>
  update: (id: string, data: Record<string, unknown>) => Promise<T>
  delete: (id: string) => Promise<unknown>
}

type TemplateRouteParams = {
  params: Promise<{ id: string }>
}

type TemplateCrudConfig<T> = {
  service: TemplateLookupService<T>
  updateSchema: ZodType<Record<string, unknown>>
  notFoundLabel: string
  slugConflictMessage: string
  deleteSuccessMessage: string
  errorPrefix: string
}

type TemplateCollectionConfig<TListInput extends Record<string, unknown>, TCreateInput extends Record<string, unknown>, TResult> = {
  service: {
    list: (filters: TListInput) => Promise<TResult[]>
    create: (data: TCreateInput) => Promise<TResult>
    getBySlug?: (slug: string) => Promise<unknown | null>
    resolveSlug?: (name: string, slug?: string) => string
  }
  listSchema: ZodType<TListInput>
  createSchema: ZodType<TCreateInput>
  slugConflictMessage: string
  listErrorMessage: string
  createErrorMessage: string
}

export async function authorizeTemplateRequest(request: NextRequest) {
  return requirePermission(request, 'manage:resources')
}

export async function resolveTemplateId(
  params: Promise<{ id: string }>
) {
  const { id } = await params
  return id
}

export function parseTemplateUpdate<T>(
  schema: ZodType<T>,
  input: unknown
) {
  const parsed = schema.safeParse(input)
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

  return parsed.data
}

export function templateNotFound(label: string) {
  return NextResponse.json(
    { success: false, error: `${label} não encontrado` },
    { status: 404 }
  )
}

export function templateConflict(message: string) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 409 }
  )
}

export function templateSuccess<T>(data: T) {
  return NextResponse.json({ success: true, data })
}

export function templateDeleteSuccess(message: string) {
  return NextResponse.json({ success: true, message })
}

export function templateServerError(message: string, error: unknown) {
  console.error(message, error)
  return NextResponse.json(
    { success: false, error: 'Erro interno do servidor' },
    { status: 500 }
  )
}

export async function ensureTemplateExists<T>(
  service: Pick<TemplateLookupService<T>, 'getById'>,
  id: string,
  notFoundLabel: string
) {
  const existing = await service.getById(id)
  if (!existing) {
    return templateNotFound(notFoundLabel)
  }

  return existing
}

export async function ensureUniqueTemplateSlug(
  service: { getBySlug?: (slug: string) => Promise<unknown | null> },
  nextSlug: string | undefined,
  currentSlug: string | undefined,
  conflictMessage: string
) {
  if (!nextSlug || nextSlug === currentSlug || !service.getBySlug) {
    return null
  }

  const existing = await service.getBySlug(nextSlug)
  if (existing) {
    return templateConflict(conflictMessage)
  }

  return null
}

export function createTemplateCrudHandlers<T>(config: TemplateCrudConfig<T>) {
  const GET = async (request: NextRequest, { params }: TemplateRouteParams) => {
    try {
      const authResult = await authorizeTemplateRequest(request)
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const id = await resolveTemplateId(params)
      const template = await ensureTemplateExists(
        config.service,
        id,
        config.notFoundLabel
      )
      if (template instanceof NextResponse) {
        return template
      }

      return templateSuccess(template)
    } catch (error) {
      return templateServerError(`${config.errorPrefix} buscar`, error)
    }
  }

  const PATCH = async (request: NextRequest, { params }: TemplateRouteParams) => {
    try {
      const authResult = await authorizeTemplateRequest(request)
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const id = await resolveTemplateId(params)
      const parsed = parseTemplateUpdate(config.updateSchema, await request.json())
      if (parsed instanceof NextResponse) {
        return parsed
      }

      const existing = await ensureTemplateExists(
        config.service,
        id,
        config.notFoundLabel
      )
      if (existing instanceof NextResponse) {
        return existing
      }

      const slugConflict = await ensureUniqueTemplateSlug(
        config.service,
        typeof (parsed as { slug?: unknown }).slug === 'string'
          ? (parsed as { slug?: string }).slug
          : undefined,
        typeof (existing as { slug?: unknown }).slug === 'string'
          ? (existing as { slug?: string }).slug
          : undefined,
        config.slugConflictMessage
      )
      if (slugConflict) {
        return slugConflict
      }

      const template = await config.service.update(id, parsed)
      return templateSuccess(template)
    } catch (error) {
      return templateServerError(`${config.errorPrefix} atualizar`, error)
    }
  }

  const DELETE = async (request: NextRequest, { params }: TemplateRouteParams) => {
    try {
      const authResult = await authorizeTemplateRequest(request)
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const id = await resolveTemplateId(params)
      const existing = await ensureTemplateExists(
        config.service,
        id,
        config.notFoundLabel
      )
      if (existing instanceof NextResponse) {
        return existing
      }

      await config.service.delete(id)
      return templateDeleteSuccess(config.deleteSuccessMessage)
    } catch (error) {
      return templateServerError(`${config.errorPrefix} excluir`, error)
    }
  }

  return { GET, PATCH, DELETE }
}

export function createTemplateCollectionHandlers<
  TListInput extends Record<string, unknown>,
  TCreateInput extends Record<string, unknown>,
  TResult
>(config: TemplateCollectionConfig<TListInput, TCreateInput, TResult>) {
  const GET = async (request: NextRequest) => {
    try {
      const authResult = await authorizeTemplateRequest(request)
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const searchParams = request.nextUrl.searchParams
      const filters = config.listSchema.safeParse(
        Object.fromEntries(searchParams.entries())
      )

      const normalizedFilters = filters.success ? filters.data : ({} as TListInput)
      return templateSuccess(await config.service.list(normalizedFilters))
    } catch (error) {
      return templateServerError(config.listErrorMessage, error)
    }
  }

  const POST = async (request: NextRequest) => {
    try {
      const authResult = await authorizeTemplateRequest(request)
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const parsed = parseTemplateUpdate(config.createSchema, await request.json())
      if (parsed instanceof NextResponse) {
        return parsed
      }

      const slug = config.service.resolveSlug?.(
        typeof parsed.name === 'string' ? parsed.name : '',
        typeof parsed.slug === 'string' ? parsed.slug : undefined
      ) ?? (typeof parsed.slug === 'string' ? parsed.slug : undefined)

      const slugConflict = await ensureUniqueTemplateSlug(
        config.service,
        slug,
        undefined,
        config.slugConflictMessage
      )
      if (slugConflict) {
        return slugConflict
      }

      return NextResponse.json(
        {
          success: true,
          data: await config.service.create(
            slug ? ({ ...parsed, slug } as TCreateInput) : parsed
          ),
        },
        { status: 201 }
      )
    } catch (error) {
      return templateServerError(config.createErrorMessage, error)
    }
  }

  return { GET, POST }
}
