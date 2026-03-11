import { NextRequest, NextResponse } from 'next/server'
import { ZodType } from 'zod'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import {
  CreateAdminUserInput,
  CreateAdminUserSchema,
  ListUsersFilter,
  ListUsersFilterSchema,
  UpdateUserInput,
  UpdateUserSchema,
  UserListResponseSchema,
} from '@/schemas/users/admin-user-schemas'

type UserRateLimitConfig = {
  permission: 'manage:users' | 'delete:users'
  key: string
  limit: number
  windowMs?: number
}

export async function authorizeAdminUserRequest(
  request: NextRequest,
  config: UserRateLimitConfig
) {
  const authResult = await requirePermission(request, config.permission)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const rl = checkRateLimit(`${config.key}:${authResult.userId}`, {
    windowMs: config.windowMs ?? 60_000,
    limit: config.limit,
  })

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfter),
        },
      }
    )
  }

  return authResult
}

export function parseAdminUserInput<T>(
  schema: ZodType<T>,
  input: unknown,
  error: string
) {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error,
        issues: parsed.error.format(),
        details: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  return parsed.data
}

export function serializeAdminUser<T extends {
  createdAt: Date
  updatedAt: Date
  subscription?: { expiresAt: Date | null } | null
}>(user: T) {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    subscription: user.subscription
      ? {
          ...user.subscription,
          expiresAt: user.subscription.expiresAt
            ? user.subscription.expiresAt.toISOString()
            : null,
        }
      : null,
  }
}

export function adminUsersServerError(message: string, error: unknown) {
  console.error(message, error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export function validateAdminUsersListResponse(input: unknown) {
  const validated = UserListResponseSchema.safeParse(input)
  if (!validated.success) {
    return adminUsersServerError('Response validation failed:', validated.error)
  }

  return validated.data
}

export function forbidSelfRoleOrBanChange(
  targetUserId: string,
  adminId: string,
  input: { banned?: boolean; role?: string }
) {
  if (targetUserId !== adminId) {
    return null
  }

  if (input.banned !== undefined || input.role !== undefined) {
    return NextResponse.json(
      { error: 'Você não pode alterar seu próprio cargo ou status de banimento.' },
      { status: 403 }
    )
  }

  return null
}

export function forbidSelfDelete(targetUserId: string, adminId: string) {
  if (targetUserId !== adminId) {
    return null
  }

  return NextResponse.json(
    { error: 'Você não pode deletar sua própria conta.' },
    { status: 403 }
  )
}

export function parseAdminUserListFilters(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  return parseAdminUserInput(
    ListUsersFilterSchema,
    {
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      role: searchParams.get('role') ?? undefined,
      banned: searchParams.get('banned') ?? undefined,
      emailVerified: searchParams.get('emailVerified') ?? undefined,
      hasSubscription: searchParams.get('hasSubscription') ?? undefined,
      subscriptionActive: searchParams.get('subscriptionActive') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      order: searchParams.get('order') ?? undefined,
    },
    'Invalid parameters'
  )
}

export function adminUsersConflict(error: string) {
  return NextResponse.json({ error }, { status: 409 })
}

export function createAdminUsersCollectionHandlers(config: {
  listUsers: (filters: ListUsersFilter) => Promise<{
    data: Array<{
      createdAt: Date
      updatedAt: Date
      subscription?: { expiresAt: Date | null } | null
    }>
    pagination: Record<string, unknown>
  }>
  createUser: (input: CreateAdminUserInput) => Promise<unknown>
}) {
  return {
    GET: async function GET(request: NextRequest) {
      try {
        const authResult = await authorizeAdminUserRequest(request, {
          permission: 'manage:users',
          key: 'admin:users:list',
          limit: 60,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        const parsed = parseAdminUserListFilters(request)
        if (parsed instanceof NextResponse) {
          return parsed
        }

        const result = await config.listUsers(parsed)
        const validated = validateAdminUsersListResponse({
          data: result.data.map(serializeAdminUser),
          pagination: result.pagination,
        })
        if (validated instanceof NextResponse) {
          return validated
        }

        return NextResponse.json(validated, {
          headers: {
            'Cache-Control': 'private, max-age=10',
          },
        })
      } catch (error) {
        return adminUsersServerError('[GET /api/v1/admin/users]', error)
      }
    },
    POST: async function POST(request: NextRequest) {
      try {
        const authResult = await authorizeAdminUserRequest(request, {
          permission: 'manage:users',
          key: 'admin:users:create',
          limit: 30,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        const parsed = parseAdminUserInput(
          CreateAdminUserSchema,
          await request.json(),
          'Dados inválidos'
        )
        if (parsed instanceof NextResponse) {
          return parsed
        }

        return NextResponse.json(await config.createUser(parsed), { status: 201 })
      } catch (error) {
        if (error instanceof Error && error.message === 'USER_EMAIL_EXISTS') {
          return adminUsersConflict('Este e-mail já está cadastrado')
        }

        return adminUsersServerError('[POST /api/v1/admin/users]', error)
      }
    },
  }
}

export function createAdminUserAvatarHandler(config: {
  uploadImage: (
    file: File,
    folder: string,
    publicId: string,
    altText?: string
  ) => Promise<{ url: string; publicId: string }>
  updateUserAvatar: (userId: string, imageUrl: string) => Promise<unknown>
}) {
  return async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const authResult = await authorizeAdminUserRequest(request, {
        permission: 'manage:users',
        key: 'admin:users:avatar',
        limit: 20,
      })
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const { id } = await params
      const formData = await request.formData()
      const file = formData.get('file')

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Apenas JPG e PNG são permitidos' },
          { status: 400 }
        )
      }

      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'A imagem deve ter no máximo 2MB' },
          { status: 400 }
        )
      }

      const uploadResult = await config.uploadImage(
        file,
        'avatar',
        `user-avatar-${id}`,
        'User Avatar'
      )

      await config.updateUserAvatar(id, uploadResult.url)

      return NextResponse.json({
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
      }

      return adminUsersServerError('[POST /api/v1/admin/users/[id]/avatar]', error)
    }
  }
}

export function createAdminUserCrudHandlers(config: {
  updateUser: (userId: string, data: UpdateUserInput) => Promise<{
    createdAt: Date
    updatedAt: Date
    subscription?: { expiresAt: Date | null } | null
  }>
  deleteUser: (userId: string) => Promise<unknown>
}) {
  return {
    PATCH: async function PATCH(
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const authResult = await authorizeAdminUserRequest(request, {
          permission: 'manage:users',
          key: 'admin:users:update',
          limit: 30,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        const { id } = await params
        const parsed = parseAdminUserInput(
          UpdateUserSchema,
          await request.json(),
          'Validation failed'
        )
        if (parsed instanceof NextResponse) {
          return parsed
        }

        const selfChangeError = forbidSelfRoleOrBanChange(id, authResult.userId, parsed)
        if (selfChangeError) {
          return selfChangeError
        }

        return NextResponse.json(serializeAdminUser(await config.updateUser(id, parsed)))
      } catch (error) {
        return adminUsersServerError('[PATCH /api/v1/admin/users/[id]]', error)
      }
    },
    DELETE: async function DELETE(
      request: NextRequest,
      { params }: { params: Promise<{ id: string }> }
    ) {
      try {
        const authResult = await authorizeAdminUserRequest(request, {
          permission: 'delete:users',
          key: 'admin:users:delete',
          limit: 10,
        })
        if (authResult instanceof NextResponse) {
          return authResult
        }

        const { id } = await params
        const selfDeleteError = forbidSelfDelete(id, authResult.userId)
        if (selfDeleteError) {
          return selfDeleteError
        }

        await config.deleteUser(id)
        return new NextResponse(null, { status: 204 })
      } catch (error) {
        return adminUsersServerError('[DELETE /api/v1/admin/users/[id]]', error)
      }
    },
  }
}

export function createAdminUserSearchHandler(config: {
  searchUsers: (input: { query: string; limit: number }) => Promise<unknown>
}) {
  return async function GET(request: NextRequest) {
    try {
      const authResult = await authorizeAdminUserRequest(request, {
        permission: 'manage:users',
        key: 'admin:users:search',
        limit: 30,
      })
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
      const limit = Math.min(Number.parseInt(request.nextUrl.searchParams.get('limit') ?? '10', 10), 50)

      if (query.length < 2) {
        return NextResponse.json(
          { users: [] },
          { headers: { 'Cache-Control': 'private, max-age=10' } }
        )
      }

      return NextResponse.json(
        { users: await config.searchUsers({ query, limit }) },
        { headers: { 'Cache-Control': 'private, max-age=10' } }
      )
    } catch (error) {
      return adminUsersServerError('[GET /api/v1/admin/users/search]', error)
    }
  }
}
