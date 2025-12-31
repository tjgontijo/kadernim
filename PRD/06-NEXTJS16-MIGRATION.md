# Next.js 16 - Atualização dos PRDs

Mudanças e impacto nos documentos criados

---

## 🚨 BREAKING CHANGES CRÍTICOS

### 1. **Async Request APIs (OBRIGATÓRIO)**

Todos os `params`, `searchParams`, `cookies()`, `headers()` agora são **Promises**.

#### IMPACTO NOS PRDs:

**Antes (Next.js 15):**
```typescript
// app/dashboard/layout.tsx
export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getCurrentSession()
  const organizationId = await getCurrentOrganizationId()
}
```

**Depois (Next.js 16):**
```typescript
// app/dashboard/layout.tsx
export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getCurrentSession()
  const organizationId = await getCurrentOrganizationId()
  // ✅ Exatamente igual - já está correto!
}
```

Mas mudança crítica em **routes com params**:

**❌ ANTES:**
```typescript
// app/dashboard/users/[id]/page.tsx
export default async function UserPage({ params }) {
  const userId = params.id  // ❌ ERRADO no Next.js 16
  const user = await fetch(`/api/users/${userId}`)
}
```

**✅ DEPOIS:**
```typescript
// app/dashboard/users/[id]/page.tsx
export default async function UserPage(props) {
  const { id } = await props.params  // ✅ CORRETO no Next.js 16
  const user = await fetch(`/api/users/${id}`)
}
```

**✅ MESMO PARA `searchParams`:**
```typescript
// Antes
export default async function Page({ searchParams }) {
  const page = searchParams.page || '1'  // ❌ ERRADO
}

// Depois
export default async function Page(props) {
  const searchParams = await props.searchParams  // ✅ CORRETO
  const page = searchParams.page || '1'
}
```

---

### 2. **Middleware → Proxy**

Renomear arquivo e atualizar código:

```bash
# 1. Renomear arquivo
mv middleware.ts proxy.ts

# 2. Atualizar função
// ❌ ANTES
export function middleware(request: Request) { }

// ✅ DEPOIS
export function proxy(request: Request) { }

# 3. Atualizar next.config.ts
const nextConfig = {
  skipProxyUrlNormalize: true  // Novo nome de config
}
```

---

### 3. **Turbopack é Padrão (Webpack Opcional)**

Se você usa webpack customizado:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack"
  }
}
```

**Para SaaS/Admin:**
- ✅ Use Turbopack (mais rápido)
- ❌ Só use Webpack se tiver configs muito específicas

---

### 4. **Parallel Routes Exigem `default.js`**

Se você usa parallel routes (ex: `@modal`):

```typescript
// ✅ OBRIGATÓRIO
// app/@modal/default.tsx
import { notFound } from 'next/navigation'

export default function Default() {
  return notFound()  // ou return null
}
```

---

### 5. **PPR (Partial Pre-Rendering)**

Configuração mudou:

```typescript
// ❌ ANTES (Next.js 15)
const nextConfig = {
  experimental: { ppr: true }
}

// ✅ DEPOIS (Next.js 16)
const nextConfig = {
  cacheComponents: true
}

// Uso em page.tsx
import { unstable_cache as cache } from 'next/cache'

export default async function Page() {
  const staticData = await cache(
    async () => fetchData(),
    ['cache-key'],
    { tags: ['myTag'], revalidate: 3600 }
  )
}
```

---

## 📝 ATUALIZAÇÕES NOS PRDs

### PRD #02 - Frontend Design System

#### Seção 2.1: Server Component Pattern

**ANTES:**
```typescript
// app/dashboard/[resource]/page.tsx
export default async function ResourcePage({ params }) {
  const id = params.id
  const data = await fetch(`/api/resources/${id}`)
}
```

**DEPOIS:**
```typescript
// app/dashboard/[resource]/page.tsx
export default async function ResourcePage(props) {
  const { id } = await props.params
  const data = await fetch(`/api/resources/${id}`)
}
```

---

### PRD #03 - Code Templates

Todos os templates que usam `params` ou `searchParams` precisam ser atualizados.

**Exemplo afetado - 1.1 Page com Tabela:**

```typescript
// ❌ ANTES
export default function ResourcePage({ searchParams }) {
  const page = searchParams.page || '1'
}

// ✅ DEPOIS
export default async function ResourcePage(props) {
  const searchParams = await props.searchParams
  const page = searchParams?.page || '1'
}
```

---

### PRD #04 - Sidebar & Header Architecture

Seção 2.1 precisa ser atualizada:

```typescript
// ❌ ANTES
export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getCurrentSession()
  const organizationId = await getCurrentOrganizationId()
}

// ✅ DEPOIS - Mesmo código (já está ok!)
// Mas se tiver route handlers com params:

// ❌ ANTES
export async function GET(request, { params }) {
  const id = params.id
}

// ✅ DEPOIS
export async function GET(request, { params }) {
  const { id } = await params
}
```

---

## ✨ NOVAS APIS ÚTEIS PARA SAAS

### 1. **updateTag** - Mudanças Imediatas

Perfeito para atualizar dados em tempo real após criar/editar:

```typescript
'use server'
import { updateTag } from 'next/cache'

export async function createUser(formData) {
  const user = await db.users.create(formData)

  // Usuário vê mudança IMEDIATAMENTE
  updateTag('users-list')
  updateTag(`user-${user.id}`)

  return user
}
```

**Uso no Cliente:**
```typescript
// components/dashboard/users/user-form-dialog.tsx
const createMutation = useMutation({
  mutationFn: async (data: UserFormInput) => {
    return await createUserAction(data)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('Usuário criado!')
  },
})
```

### 2. **revalidateTag** com `cacheLife`

Para revalidação inteligente:

```typescript
'use server'
import { revalidateTag } from 'next/cache'

export async function updateUserProfile(userId, profile) {
  await db.users.update(userId, profile)

  // Mostra cache antigo enquanto revalida em background
  revalidateTag(`user-${userId}`, 'max')
}
```

### 3. **refresh** - Atualizar Router

Atualizar componentes específicos sem recarregar página:

```typescript
'use server'
import { refresh } from 'next/cache'

export async function markNotificationAsRead(notificationId) {
  await db.notifications.markAsRead(notificationId)

  // Atualiza o header com novo count de notificações
  refresh()
}
```

---

## 🔄 STACK ATUALIZADO

```
Frontend: Next.js 16 (App Router - obrigatório)
Build: Turbopack (padrão)
React: 19.2+
Compiler: React Compiler (estável)
Bundler: Turbopack (Webpack opcional)
```

---

## 📋 CHECKLIST DE MIGRAÇÃO

```bash
# 1. Atualizar dependências
npm install next@latest react@latest react-dom@latest
npm install -D @types/react @types/react-dom

# 2. Gerar tipos para params/searchParams
npx next typegen

# 3. Executar codemod automático
npx @next/codemod@canary upgrade latest

# 4. Verificar e atualizar manualmente:
  ☐ Todos os params { } → await props.params
  ☐ Todos os searchParams { } → await props.searchParams
  ☐ Cookies, headers, draftMode
  ☐ Renomear middleware → proxy
  ☐ Adicionar default.js em parallel routes

# 5. Atualizar configs:
  ☐ skipProxyUrlNormalize no next.config.ts
  ☐ PPR: experimental.ppr → cacheComponents
  ☐ React Compiler: reactCompiler: true

# 6. Testar
  npm run dev
  npm run build
```

---

## 🧹 LIMPEZA DOS PRDs

### O que precisa ser atualizado:

| Documento | Seções Afetadas | Ação |
|-----------|-----------------|------|
| **02-Design System** | 2.1 (Server), Exemplos | Atualizar params/searchParams |
| **03-Templates** | 1.1 (Pages), 5 (Hooks) | Atualizar todos os params |
| **04-Sidebar** | 2.1 (Layout) | Confirmar que está ok |
| **05-Quick Ref** | - | Já atualizado para 15+ |

---

## 🚀 BENEFÍCIOS PARA SEU SAAS

✅ **Turbopack** - Build 10x mais rápido
✅ **updateTag** - Atualizações em tempo real
✅ **React Compiler** - Performance automática
✅ **Async Params** - Melhor type safety
✅ **Proxy** - Middleware mais simples

---

## ⚠️ CUIDADO COM:

1. **Libs antigas** que usam Webpack plugins customizados
2. **Runtime Config** - Foi completamente removido
3. **Image optimization** - Alguns padrões mudaram
4. **ESLint** - Agora usa Flat Config

---

## 📌 RESUMO EXECUTIVO

**Para os PRDs criados:**

1. ✅ **Arquitetura geral** - Continua 100% válida
2. ⚠️ **Exemplos de código** - Precisam de `await props.params`
3. ✅ **Padrões** - Ainda aplicáveis
4. ✅ **Stack** - Atualizar para Next.js 16
5. ✨ **Novas APIs** - `updateTag`, `refresh` úteis para CRUD

---

## 🎯 PRÓXIMAS AÇÕES

1. **Atualizar templates de código** nos PRDs com nova sintaxe
2. **Executar codemods** automaticamente ao scaffold
3. **Testar** todos os exemplos com Next.js 16
4. **Documentar** novas APIs (`updateTag`, `refresh`)

---

**Versão**: 1.0 (Next.js 16)
**Data**: 2025-12-30
**Status**: Todos os PRDs compatíveis após atualização de sintaxe
