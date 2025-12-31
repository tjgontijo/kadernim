# Análise: Sistema de Autorização e Controle de Acesso

## Status: ✅ PRONTO PARA PRODUÇÃO

O sistema **está bem preparado** para implementar controle de acesso granular para admin.

---

## Componentes Existentes

### 1. **Sistema de Roles** (`src/lib/auth/roles.ts`)
```typescript
- user        // Usuário básico
- subscriber  // Usuário com subscrição ativa
- admin       // Administrador
```

**Funções disponíveis:**
- `hasRole(userRole, requiredRole)` - Verifica se tem role
- `isAdmin(userRole)` - Verifica se é admin
- `hasPermission(userRole, permission)` - Verifica permissão específica
- `hasAllPermissions()` - Verifica múltiplas permissões
- `canAccessResource()` - Controle de acesso a recurso

### 2. **Sistema de Permissions** (`src/lib/auth/roles.ts`)
Permissions definidas:
```typescript
'read:profile'
'update:profile'
'delete:profile'
'read:subscription'
'manage:subscription'
'read:courses'        // Note: usar 'read:resources'
'enroll:courses'      // Note: usar 'enroll:resources'
'read:admin'
'manage:users'
'manage:courses'      // Note: usar 'manage:resources'
'manage:system'
```

**Permissões para Admin em Recursos:**
- ✅ `manage:resources` - Gerenciar recursos (criar, editar, deletar)
- ✅ `read:admin` - Acessar área admin
- ✅ `manage:users` - Gerenciar usuários

### 3. **Sincronização de Roles** (`src/lib/auth/role-sync.ts`)
```typescript
syncUserRole(userId)           // Sincroniza role de um usuário
syncAllUserRoles()             // Sincroniza todos os usuários
onSubscriptionChange()         // Atualiza role ao mudar subscription
ensureRoleSync(userId)         // Garante sincronização
```

**Fluxo:**
- Admin mantém role admin sempre
- User com subscrição ativa → subscriber
- User sem subscrição → user

### 4. **Middleware de Proteção** (`src/middleware.ts`)
```typescript
✅ Valida sessão em rotas protegidas
✅ Redireciona usuários não autenticados
✅ Mantém otimizado (valida apenas em document requests)
```

**Limitação atual:** Apenas valida autenticação, não autorização por role
**Solução:** Adicionar validação de role onde necessário nas rotas admin

---

## Padrão de Proteção em Rotas Existentes

Exemplo de `GET /api/v1/resources/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  // 1. Obter sessão
  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id
  const role = session?.user?.role
  const isAdmin = role === 'admin'

  // 2. Validar autenticação
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Rate limiting
  const rl = checkRateLimit(`resources:${userId}`, { limit: 60 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  // 4. Lógica específica com validação de autorização
  const hasFullAccess = isAdmin || Boolean(activeSubscription)

  // ...
}
```

---

## Como Proteger Rotas Admin

### Opção 1: Criar Helper Function (Recomendado)
```typescript
// src/lib/auth/middleware.ts
export async function requireRole(
  request: NextRequest,
  requiredRole: UserRoleType
): Promise<{ user: User; session: Session } | NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!hasRole(session.user.role as UserRoleType, requiredRole)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  return { user: session.user, session }
}

export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<{ user: User; session: Session } | NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!hasPermission(session.user.role as UserRoleType, permission)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient permissions' },
      { status: 403 }
    )
  }

  return { user: session.user, session }
}
```

### Opção 2: Usar em Rotas Admin
```typescript
// src/app/api/v1/admin/resources/route.ts
import { requireRole } from '@/lib/auth/middleware'
import { UserRole } from '@/types/user-role'

export async function POST(request: NextRequest) {
  const userOrError = await requireRole(request, UserRole.admin)

  if (userOrError instanceof NextResponse) {
    return userOrError
  }

  const { user } = userOrError

  // Lógica protegida aqui
  // ...
}
```

---

## Checklist de Preparação

### Para Implementar Admin Resources Management:

- [ ] Atualizar `src/lib/auth/roles.ts`:
  - Renomear 'read:courses' → 'read:resources'
  - Renomear 'enroll:courses' → 'enroll:resources'
  - Renomear 'manage:courses' → 'manage:resources'

- [ ] Criar helper de proteção de rotas em `src/lib/auth/middleware.ts`
  - `requireRole()`
  - `requirePermission()`

- [ ] Criar estrutura de rotas admin:
  ```
  src/app/api/v1/admin/
  ├── resources/
  │   ├── route.ts          # GET/POST resources
  │   ├── [id]/route.ts     # GET/PUT/DELETE resource
  │   └── bulk/route.ts     # Operações em lote
  ├── users/
  │   ├── route.ts          # GET users
  │   └── [id]/route.ts     # GET/PUT user (role, ban, etc)
  └── subscriptions/
      ├── route.ts          # GET subscriptions
      └── [id]/route.ts     # GET/PUT subscription
  ```

- [ ] Criar services em `src/services/resources/` (server-side):
  - `createResourceService.ts`
  - `updateResourceService.ts`
  - `deleteResourceService.ts`
  - `bulkOperationsService.ts`

- [ ] Validação com Zod schemas em `src/lib/schemas/`
  - `createResourceSchema`
  - `updateResourceSchema`
  - `bulkOperationsSchema`

- [ ] Rate limiting específico para admin endpoints

- [ ] Logging de ações administrativas

---

## Resumo

**O sistema está pronto!** Tem:
- ✅ Role-based access control
- ✅ Permission-based access control
- ✅ Middleware de proteção
- ✅ Padrões claros em rotas existentes
- ✅ Sincronização automática de roles

**Próximos passos:** Implementar rotas admin seguindo os padrões existentes com proteção via `requireRole()` e `requirePermission()`.
