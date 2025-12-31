# PRD: Gerenciamento de Usuários (Admin)

**Data:** 2025-12-31  
**Versão:** 1.0  
**Status:** Planejado  
**Referência:** Implementação de `/admin/resources` (padrão a seguir)

---

## 1. Visão Geral

Sistema administrativo para **visualizar, filtrar, editar e gerenciar usuários** no Kadernim, seguindo exatamente o mesmo padrão visual e arquitetural já implementado em `/admin/resources`.

**Escopo:**
- Listagem de usuários com paginação e filtros
- Visualização em tabela (desktop) e cards (mobile)
- Ações: editar role, banir/desbanir, gerenciar assinatura
- Filtros por role, status de assinatura, email verificado, banido

**Acesso:** Apenas usuários com `role: admin`

---

## 2. Modelo de Dados (Prisma Schema)

### User (Existente)
```prisma
model User {
  id               String     @id @default(cuid())
  name             String
  email            String     @unique
  phone            String?
  emailVerified    Boolean    @default(false)
  image            String?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  role             UserRole   @default(user)  
  banned           Boolean    @default(false)
  
  accounts         Account[]
  sessions         Session[]
  subscription     Subscription?
  resourceAccesses UserResourceAccess[]
}

enum UserRole {
  user
  subscriber
  admin
}
```

### Subscription (Existente)
```prisma
model Subscription {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(...)
  isActive      Boolean  @default(true)
  purchaseDate  DateTime @default(now())
  expiresAt     DateTime?
}
```

---

## 3. Arquitetura de Arquivos

Seguindo o padrão de `/admin/resources`:

```
src/
├── app/
│   ├── admin/
│   │   └── users/
│   │       └── page.tsx                    # Página principal (baseada em resources/page.tsx)
│   └── api/v1/admin/users/
│       ├── route.ts                        # GET (list), POST (create - se necessário)
│       └── [id]/
│           └── route.ts                    # GET, PATCH, DELETE
│
├── components/dashboard/users/
│   ├── index.ts                            # Barrel exports
│   ├── users-table-view.tsx                # Visualização tabela (desktop)
│   └── users-card-view.tsx                 # Visualização cards (mobile)
│
├── hooks/
│   └── useAdminUsers.ts                    # Hook React Query
│
├── lib/schemas/admin/
│   └── users.ts                            # Zod schemas
│
└── services/users/
    ├── list-users.ts                       # Service de listagem
    └── update-user.ts                      # Service de atualização
```

---

## 4. API Endpoints

### 4.1 GET /api/v1/admin/users (Listar)

**Query Parameters:**
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `page` | number | 1 | Página atual |
| `limit` | number | 15 | Itens por página (max: 100) |
| `q` | string | - | Busca por nome ou email |
| `role` | enum | - | Filtrar por role (user/subscriber/admin) |
| `banned` | boolean | - | Filtrar por banido |
| `emailVerified` | boolean | - | Filtrar por email verificado |
| `hasSubscription` | boolean | - | Tem assinatura? |
| `subscriptionActive` | boolean | - | Assinatura ativa? |
| `sortBy` | string | 'createdAt' | Campo para ordenação |
| `order` | string | 'desc' | Direção da ordenação |

**Response (200 OK):**
```typescript
{
  data: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
    role: 'user' | 'subscriber' | 'admin'
    emailVerified: boolean
    banned: boolean
    subscription: {
      isActive: boolean
      expiresAt: string | null
    } | null
    resourceAccessCount: number
    createdAt: string
    updatedAt: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}
```

### 4.2 PATCH /api/v1/admin/users/[id] (Atualizar)

**Body:**
```typescript
{
  role?: 'user' | 'subscriber' | 'admin'
  banned?: boolean
}
```

**Response (200 OK):** Objeto do usuário atualizado

### 4.3 DELETE /api/v1/admin/users/[id] (Deletar)

**Response:** 204 No Content

---

## 5. Zod Schemas (`src/lib/schemas/admin/users.ts`)

```typescript
import { z } from 'zod'
import { USER_ROLE_VALUES } from '@/types/user-role'

// ============================================
// LIST USERS FILTER SCHEMA
// ============================================
export const ListUsersFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(15),
  q: z.string().trim().max(100).optional(),
  role: z.enum(['user', 'subscriber', 'admin']).optional(),
  banned: z.coerce.boolean().optional(),
  emailVerified: z.coerce.boolean().optional(),
  hasSubscription: z.coerce.boolean().optional(),
  subscriptionActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'role']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type ListUsersFilter = z.infer<typeof ListUsersFilterSchema>

// ============================================
// UPDATE USER SCHEMA
// ============================================
export const UpdateUserSchema = z.object({
  role: z.enum(['user', 'subscriber', 'admin']).optional(),
  banned: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

// ============================================
// USER LIST RESPONSE SCHEMA
// ============================================
export const UserListResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    image: z.string().nullable(),
    role: z.enum(['user', 'subscriber', 'admin']),
    emailVerified: z.boolean(),
    banned: z.boolean(),
    subscription: z.object({
      isActive: z.boolean(),
      expiresAt: z.string().nullable(),
    }).nullable(),
    resourceAccessCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  }),
})

export type UserListResponse = z.infer<typeof UserListResponseSchema>
```

---

## 6. Service (`src/services/users/list-users.ts`)

```typescript
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/prisma'
import { ListUsersFilter } from '@/lib/schemas/admin/users'

interface ListUsersResponse {
  data: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
    role: 'user' | 'subscriber' | 'admin'
    emailVerified: boolean
    banned: boolean
    subscription: {
      isActive: boolean
      expiresAt: Date | null
    } | null
    resourceAccessCount: number
    createdAt: Date
    updatedAt: Date
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export async function listUsersService(
  filters: ListUsersFilter
): Promise<ListUsersResponse> {
  const { page, limit, q, role, banned, emailVerified, hasSubscription, subscriptionActive, sortBy, order } = filters

  // Build where conditions
  const whereConditions: Prisma.UserWhereInput = {}

  if (q) {
    whereConditions.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (role) whereConditions.role = role
  if (banned !== undefined) whereConditions.banned = banned
  if (emailVerified !== undefined) whereConditions.emailVerified = emailVerified
  
  if (hasSubscription !== undefined) {
    whereConditions.subscription = hasSubscription ? { isNot: null } : { is: null }
  }
  
  if (subscriptionActive !== undefined) {
    whereConditions.subscription = { isActive: subscriptionActive }
  }

  const total = await prisma.user.count({ where: whereConditions })
  const skip = (page - 1) * limit
  const totalPages = Math.ceil(total / limit)
  const hasMore = page < totalPages

  const users = await prisma.user.findMany({
    where: whereConditions,
    orderBy: { [sortBy]: order },
    skip,
    take: limit,
    include: {
      subscription: { select: { isActive: true, expiresAt: true } },
      resourceAccesses: { select: { id: true } },
    },
  })

  const data = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
    banned: user.banned,
    subscription: user.subscription,
    resourceAccessCount: user.resourceAccesses.length,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }))

  return { data, pagination: { page, limit, total, totalPages, hasMore } }
}
```

---

## 7. Hook React Query (`src/hooks/useAdminUsers.ts`)

Seguindo exatamente o padrão de `useAdminResources.ts`:

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListUsersFilter, UserListResponse, UpdateUserInput } from '@/lib/schemas/admin/users'

interface UseAdminUsersOptions {
  filters?: Partial<ListUsersFilter>
}

export function useAdminUsers(options?: UseAdminUsersOptions) {
  const filters = options?.filters || {}
  const page = filters.page || 1
  const limit = filters.limit || 15
  const q = filters.q || ''
  const role = filters.role || ''
  const banned = filters.banned
  const emailVerified = filters.emailVerified
  const sortBy = filters.sortBy || 'createdAt'
  const order = filters.order || 'desc'

  return useQuery<UserListResponse>({
    queryKey: ['admin-users', { page, limit, q, role, banned, emailVerified, sortBy, order }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })

      if (q) params.append('q', q)
      if (role) params.append('role', role)
      if (banned !== undefined) params.append('banned', String(banned))
      if (emailVerified !== undefined) params.append('emailVerified', String(emailVerified))
      params.append('sortBy', sortBy)
      params.append('order', order)

      const response = await fetch(`/api/v1/admin/users?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    },
  })
}

export function useUpdateAdminUser(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useDeleteAdminUser(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/admin/users/${userId}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
```

---

## 8. Componentes UI

### 8.1 Estrutura de Export (`components/dashboard/users/index.ts`)

```typescript
export { UsersCardView } from './users-card-view'
export { UsersTableView } from './users-table-view'
```

### 8.2 Type User (para os componentes)

```typescript
type User = {
  id: string
  name: string
  email: string
  phone?: string | null
  image?: string | null
  role: 'user' | 'subscriber' | 'admin'
  emailVerified: boolean
  banned: boolean
  subscription?: {
    isActive: boolean
    expiresAt: string | null
  } | null
  resourceAccessCount: number
  createdAt: Date
  updatedAt: Date
}
```

### 8.3 Colunas da Tabela

| Coluna | ID | Descrição | Visível Default |
|--------|----|-----------| --------------- |
| Avatar + Nome + Email | (sempre visível) | Imagem, nome e email | ✅ |
| Role | `role` | Badge: user/subscriber/admin | ✅ |
| Assinatura | `subscription` | Status da assinatura | ✅ |
| Verificado | `emailVerified` | Ícone ✓ se verificado | ❌ |
| Banido | `banned` | Badge vermelho se banido | ❌ |
| Recursos | `resourceAccessCount` | Qtd de recursos acessados | ❌ |
| Criado em | `createdAt` | Data de criação | ✅ |
| Ações | (sempre visível) | Botões ver/editar/banir | ✅ |

### 8.4 Badges de Role

```tsx
// user (cinza)
<Badge variant="outline" className="text-[10px]">Usuário</Badge>

// subscriber (primário/roxo)
<Badge variant="default" className="text-[10px]">Assinante</Badge>

// admin (vermelho)
<Badge variant="destructive" className="text-[10px]">Admin</Badge>
```

### 8.5 Status de Assinatura

```tsx
// Sem assinatura
<span className="text-muted-foreground text-xs">—</span>

// Assinatura ativa
<Badge variant="outline" className="text-[10px] border-green-500/20 bg-green-500/10 text-green-600">
  Ativo
</Badge>

// Assinatura expirada
<Badge variant="outline" className="text-[10px] border-orange-500/20 bg-orange-500/10 text-orange-600">
  Expirado
</Badge>
```

---

## 9. Página Admin (`app/admin/users/page.tsx`)

### 9.1 Filtros Disponíveis

Seguindo o padrão de resources com dropdowns pill-style:

| Filtro | Ícone | Opções |
|--------|-------|--------|
| Role | `Shield` | user, subscriber, admin |
| Status | `UserCheck` | Ativo, Inativo, Banido |
| Switch | - | "Apenas verificados" |

### 9.2 Constantes de Filtro

```typescript
const ROLE_OPTIONS = [
  { value: 'user', label: 'Usuário' },
  { value: 'subscriber', label: 'Assinante' },
  { value: 'admin', label: 'Admin' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Assinatura Ativa' },
  { value: 'inactive', label: 'Sem Assinatura' },
  { value: 'banned', label: 'Banido' },
]
```

### 9.3 Ações por Usuário (hover na row)

| Ícone | Ação | Descrição |
|-------|------|-----------|
| `Eye` | Ver detalhes | Abre modal/drawer com detalhes |
| `Edit` | Editar | Altera role ou outros dados |
| `Ban` | Banir/Desbanir | Toggle do status banned |

---

## 10. Fluxo de Implementação

### Fase 1: Backend (Estimativa: 2h)
1. [ ] `src/lib/schemas/admin/users.ts`
2. [ ] `src/services/users/list-users.ts`
3. [ ] `src/services/users/update-user.ts`
4. [ ] `src/app/api/v1/admin/users/route.ts` (GET)
5. [ ] `src/app/api/v1/admin/users/[id]/route.ts` (PATCH, DELETE)

### Fase 2: Frontend Hooks (Estimativa: 30min)
1. [ ] `src/hooks/useAdminUsers.ts`

### Fase 3: Componentes (Estimativa: 1.5h)
1. [ ] `src/components/dashboard/users/users-table-view.tsx`
2. [ ] `src/components/dashboard/users/users-card-view.tsx`
3. [ ] `src/components/dashboard/users/index.ts`

### Fase 4: Página (Estimativa: 1h)
1. [ ] `src/app/admin/users/page.tsx` (baseada em resources/page.tsx)

### Fase 5: Extras (Estimativa: 1h)
1. [ ] Actions de banir/desbanir
2. [ ] Drawer de detalhes do usuário
3. [ ] Testes e ajustes

**Total Estimado: ~6 horas**

---

## 11. Considerações de Segurança

- ✅ Todas as rotas verificam `role === 'admin'`
- ✅ Rate limiting: 60 req/min para listagem, 10 req/min para mutações
- ⚠️ Admin não pode deletar/banir a si mesmo
- ⚠️ Admin não pode rebaixar o próprio role
- ✅ Logs para ações sensíveis (banir, deletar, mudar role)

---

## 12. Aprovação

**Pronto para implementação?** ☐ Sim ☐ Não ☐ Com mudanças

**Comentários:**
_____________________________________________________

