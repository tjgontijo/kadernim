# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

### Common Commands

```bash
# Start development server with Turbopack (fastest)
npm run dev
# Access at http://localhost:3000

# Build for production
npm run build

# Start production server (after build)
npm start

# Lint TypeScript and ESLint
npm run lint

# Database seeding (populates initial data)
npx prisma db seed
```

### Testing Database Locally

```bash
# Access Prisma Studio (GUI for database)
npx prisma studio

# Run migrations
npx prisma migrate dev --name <migration_name>

# Generate Prisma client after schema changes
npx prisma generate
```

### Environment Setup

Required environment variables in `.env` (see `.env.example`):

**Critical for running locally:**
- `DATABASE_URL` - PostgreSQL connection string (e.g., Supabase)
- `NEXT_PUBLIC_APP_URL` - App URL (http://localhost:3000 for dev)
- `BETTER_AUTH_SECRET` / `AUTH_SECRET` - Random secure strings
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` - Web Push keys
- `RESEND_API_KEY` - Email delivery (or setup SMTP fallback)
- `UAZAPI_TOKEN` - WhatsApp delivery (optional for testing)
- `DOWNLOAD_TOKEN_SECRET` - Resource download signing

## High-Level Architecture

### System Overview

**Kadernim** is a full-stack Next.js application for managing educational resources. It implements a **subscription + access-control model** where:

- Users authenticate via OTP, Magic Link, or Google (Better-Auth)
- Free resources are available to everyone
- Paid resources require an active subscription or individual grant
- Resources are enrolled via external webhooks (e-commerce integrations)

### Request Flow

```
Browser (React + React Query)
    ↓
Middleware (session validation)
    ↓
API Route Handler (validation + rate limiting)
    ↓
Server Services (business logic)
    ↓
Prisma ORM → PostgreSQL Database
```

### Key Architectural Patterns

#### 1. **Multi-Layer Access Control** (`src/server/services/accessService.ts`)

Access rules are computed dynamically in SQL:
```
- Admin users → Always have access
- Free resources (isFree=true) → Everyone can access
- Active subscription → Can access non-free resources
- Specific grants (resourceUserAccess) → Individual grants with optional expiration
```

The `buildHasAccessConditionSql()` function encodes these as SQL WHERE conditions, enabling database-level filtering. **Always use this service** to determine resource access.

#### 2. **Service Layer Composition**

Business logic is split into focused services:

- **accessService** - Core access rule evaluation (database-agnostic)
- **resourceCountService** - Returns counts for tabs (all/mine/free)
- **resourceListService** - Filtered, paginated resource listing
- **resourceSummaryService** - Orchestrates all above + metadata (used by frontend)

**Pattern:** Each service does one thing well. `resourceSummaryService` composes them for frontend needs.

#### 3. **Multi-Layer Caching Strategy**

1. **HTTP Cache** - `Cache-Control: private, max-age=30, stale-while-revalidate=120`
2. **Next.js Server Cache** - `unstable_cache()` with revalidation and tags
3. **React Query Client Cache** - 30s stale time, 5min garbage collection
4. **Cache Keys** - Include userId, subscription status, and filters

**Impact:** First load is fastest, subsequent loads are instant, stale data is refreshed in background.

#### 4. **Webhook-Based Enrollment** (`src/app/api/v1/enroll/route.ts`)

External services (e-commerce) trigger enrollment via webhook:
```
POST /api/v1/enroll
Headers: x-api-key: <WEBHOOK_API_KEY>
Body: { email, product_ids, expiresAt, ... }

Response: { success: true, grantedIds: [...] }
```

This creates/updates user accounts and grants resource access. **Critical:** Webhook validates API key and cache-invalidates after completion.

#### 5. **Authentication (Better-Auth Framework)**

**Architecture:**
- **Server:** `src/server/auth/auth.ts` - Better-Auth config (secrets, plugins, database)
- **Client:** `src/lib/auth/auth-client.ts` - React hooks (`useSession`, `signOut`, etc)
- **Middleware:** `src/server/auth/middleware.ts` - Permission checks (`requirePermission`)

Routes in `/api/v1/auth/[...all]`:
- **Email/OTP** - Send code → Verify code → Create session
- **Magic Link** - Send link → Click link → Create session
- **Google OAuth** - Integrated via Better-Auth

**Session handling:**
- Sessions stored in database (with expiration)
- React Query caches session with 5min stale time
- Middleware validates on each request for document routes (not API routes)

**Important:** Always import from correct location:
- Server code: `import { auth } from '@/server/auth/auth'`
- Client code: `import { authClient, useSession } from '@/lib/auth/auth-client'`

#### 6. **Reusable CRUD Framework** (`src/components/admin/crud/`)

Generic CRUD components for building admin interfaces consistently:

**Components:**
- `CrudPageShell` - Full page layout (header, search, pagination, filters)
- `CrudDataView` - View switcher (list/cards/kanban)
- `CrudListView` - Generic table with configurable columns
- `CrudCardView` - Generic card grid with configurable layout
- `CrudEditDrawer` - Slide-out drawer for create/edit forms

**Features:**
- View mode selection (list, cards, kanban planned)
- Configurable per entity via `enabledViews` prop
- Built-in pagination, search, filters
- Responsive (mobile/desktop variants)
- Type-safe with TypeScript generics

**Usage example:**
```typescript
import { CrudPageShell, CrudListView, CrudCardView } from '@/components/admin/crud'

<CrudPageShell
  title="My Entity"
  enabledViews={['list', 'cards']}
  {...crudState}
>
  <CrudDataView
    data={items}
    view={view}
    tableView={<CrudListView data={items} columns={columns} />}
    cardView={<CrudCardView data={items} config={cardConfig} />}
  />
</CrudPageShell>
```

**Currently used in:** `admin/subjects` (testing), planned for `admin/resources` and `admin/users`

### Directory Structure

**Key directories to know:**

**Application & API:**
- `src/app/((client))/` - Dashboard pages (resources, admin, etc)
- `src/app/api/v1/` - API route handlers (organized by feature)

**Components:**
- `src/components/admin/crud/` - Reusable CRUD framework (page shell, views, drawers)
- `src/components/(client)/` - Dashboard-specific UI components
- `src/components/ui/` - Shadcn UI components (base design system)

**Server-side Code:**
- `src/server/auth/` - Better-Auth server config and middleware
  - `index.ts` - Clean exports
  - `auth.ts` - Better-Auth instance (with secrets, plugins)
  - `middleware.ts` - Authentication middleware
- `src/server/services/` - Business logic services (reusable, testable)
- `src/server/clients/` - External service clients (with API keys/secrets)
  - `cloudinary/` - Cloudinary image/video/file clients
- `src/server/utils/` - Server utilities (rate-limit, cache, etc)

**Client-side & Shared:**
- `src/lib/` - Shared code (works on both client and server)
  - `db.ts` - Prisma client singleton (use this, don't create new instances)
  - `auth/` - Client-side auth (React hooks, permissions, roles)
    - `index.ts` - Clean exports
    - `auth-client.ts` - Better-Auth React client
    - `permissions.ts` - Permission system (CASL)
    - `roles.ts` - Role definitions
  - `schemas/` - Zod validation schemas (request/response)
  - `utils/` - Shared utilities (password, phone, cn, etc)
- `src/hooks/` - Custom React hooks (useResourcesSummaryQuery, useSessionQuery)
- `src/services/` - Shared services (auth, delivery, resources, users)

**Database:**
- `prisma/schema.prisma` - Database schema (source of truth)
- `prisma/seeds/` - Database seeding scripts

**Important files:**

- [src/middleware.ts](src/middleware.ts) - Route protection and session validation (Edge Runtime)
- [src/lib/db.ts](src/lib/db.ts) - Prisma client singleton (use this, don't create new instances)
- [src/server/auth/auth.ts](src/server/auth/auth.ts) - Better-Auth server configuration
- [src/lib/auth/auth-client.ts](src/lib/auth/auth-client.ts) - Better-Auth React client (hooks)
- [src/server/services/accessService.ts](src/server/services/accessService.ts) - Access control logic (ALWAYS use this for checking resource access)
- [src/app/api/v1/resources/summary/route.ts](src/app/api/v1/resources/summary/route.ts) - Main data fetching endpoint

### Database Schema (Prisma)

Key models:
- **User** - Authenticated users (role: user/subscriber/admin)
- **Subscription** - Active subscriptions with expiration tracking
- **Resource** - Educational resources with metadata
- **ResourceFile** - Attachments to resources
- **resourceUserAccess** - Individual access grants (can expire)
- **Session** - Active auth sessions (managed by Better-Auth)
- **Verification** - OTP/Magic link codes (managed by Better-Auth)

**Important:** Always use Prisma Client (from `src/lib/db.ts`) for database queries.

### Performance Considerations

1. **Pagination** - Always paginate large queries (default: 20 items per page)
2. **Database Indexes** - Present on (userId, resourceId), education level, subject
3. **Rate Limiting** - 60 requests/min per user on `/api/v1/resources/summary`
4. **Query Optimization** - Use Prisma's `select()` to fetch only needed fields
5. **Cache Invalidation** - Use `revalidateTag()` after mutations, not `revalidatePath()`

### Debugging Tips

**To debug API responses:**
```bash
# Watch network tab in DevTools (F12 in browser)
# Check React Query DevTools (auto-mounted in dev)
# Inspect Prisma Studio: npx prisma studio
```

**Common issues:**

- **"Access denied" on resources** - Check `accessService` logic and user's subscription status
- **Stale data** - Clear React Query cache: `queryClient.clear()` in browser console
- **Database connection fails** - Verify `DATABASE_URL` and that Supabase is accessible
- **Middleware issues** - Check [src/middleware.ts](src/middleware.ts) route matching logic

## Key Design Decisions

1. **Why service composition?** - Reduces code duplication, makes testing easier, aligns with domain logic
2. **Why SQL-based access control?** - Faster than filtering in JavaScript, leverages database indexes
3. **Why multi-layer caching?** - Balances freshness (stale-while-revalidate) with performance (instant responses)
4. **Why webhook enrollment?** - Decouples e-commerce systems; scales to multiple platforms
5. **Why Edge Runtime middleware?** - Fastest session validation (no cold starts)
6. **Why separate `lib/` and `server/` for auth?** - Security (server secrets isolated), tree-shaking (client bundles exclude server code), Better-Auth best practices

## Import Path Guidelines

**Always use these correct import paths:**

**Database (shared - works everywhere):**
```typescript
import { prisma } from '@/lib/db'
```

**Server-side imports (API routes, server components, middleware):**
```typescript
// Auth (can also use index exports)
import { auth } from '@/server/auth'
import { requirePermission } from '@/server/auth'

// External clients
import { uploadImage, deleteImage } from '@/server/clients/cloudinary'

// Server utilities
import { checkRateLimit, buildResourceCacheTag } from '@/server/utils'
```

**Client-side imports (React components, hooks):**
```typescript
// Auth (can also use index exports)
import { authClient, useSession, ROLES, can } from '@/lib/auth'

// Or specific imports
import { authClient } from '@/lib/auth/auth-client'
import { ROLES } from '@/lib/auth/roles'
import { can } from '@/lib/auth/permissions'
```

**Shared imports (both client and server):**
```typescript
import { ResourceSchema } from '@/lib/schemas/admin/resources'
import { formatPhone, hashPassword } from '@/lib/utils/phone'
```

**CRUD Framework:**
```typescript
import { CrudPageShell, CrudListView, CrudCardView } from '@/components/admin/crud'
```
