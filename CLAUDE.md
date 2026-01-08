# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kadernim** is a full-stack SaaS platform for Brazilian teachers - an educational resource management and lesson planning application built with Next.js 16 and a comprehensive modern tech stack.

**Key Features:**
- Resource cataloging with Brazilian curriculum (BNCC) integration
- Lesson plan creation and management
- Community-driven feature requests
- AI-powered content generation (OpenAI integration)
- WhatsApp integration for teacher engagement
- Document export (Word, PDF)
- Progressive Web App (PWA) support

## Common Commands

### Development
- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build for production and generate Service Worker
- `npm run start` - Run production server
- `npm run lint` - Run ESLint

### Database & Migrations
- `npx prisma migrate dev --name <migration_name>` - Create and run a database migration
- `npx prisma studio` - Open Prisma Studio (visual database browser)
- `npx prisma db seed` - Run seed scripts (if configured in prisma/seed.ts)
- `npx prisma generate` - Regenerate Prisma client after schema changes

### Background Jobs (Inngest)
- `npm run event` - Start Inngest CLI for local event development

### Linting & Code Quality
- `npm run lint -- --fix` - Fix ESLint issues automatically
- `npm run lint -- src/path/to/file.ts` - Lint a specific file

## Project Architecture

### Directory Structure

**`src/app/`** - Next.js App Router pages and API routes
- `(client)/` - Client-facing authenticated pages (account, lesson-plans, resources, community)
- `admin/` - Admin dashboard (resource/user/subject/template management, analytics)
- `api/v1/` - RESTful API endpoints (versioned, organized by domain)
- `login/` - Authentication pages
- `offline/` - PWA offline pages

**`src/components/`** - React components
- `ui/` - Reusable shadcn/ui primitives
- `admin/` - Admin-specific components
- `client/` - Client-facing components (layout, resources, lessons, community, quiz)
- `home/` - Landing page components
- `auth/` - Authentication components
- `pwa/` - PWA-specific components

**`src/services/`** - Business logic layer
- `auth/` - Authentication & authorization
- `resources/` - Resource management (catalog + admin operations)
- `lesson-plans/` - Lesson plan operations
- `community/` - Community features & voting
- `llm/` - OpenAI integration for AI features
- `mail/` - Email templates & sending (Resend/Nodemailer)
- `notification/` - Push & email notifications
- `whatsapp/` - WhatsApp integration adapters
- `bncc/` - Brazilian curriculum (BNCC) services
- `users/` - User management

**`src/lib/`** - Utilities and helpers
- `auth/` - Authentication utilities (Better Auth config)
- `ai/` - LLM prompts and utilities
- `schemas/` - Zod validation schemas (centralized)
- `utils/` - General helper functions
- `inngest/` - Background job definitions
- `events/` - Event system
- `pwa/` - PWA utilities (service worker)
- `export/` - Document export (Word/PDF generation)
- `db.ts` - Prisma client singleton

**`src/hooks/`** - Custom React hooks
- Named by domain: `use-resources-*`, `use-lesson-plan-*`, `use-community-*`

**`src/server/`** - Server-only utilities
- `auth/` - Better Auth configuration
- `clients/` - External API clients (Cloudinary, etc.)

**`src/types/`** - TypeScript type definitions

**`prisma/`** - Database
- `schema.prisma` - Database schema (PostgreSQL)
- `migrations/` - Migration files
- `generated/prisma/` - Generated Prisma client

### Key Architecture Patterns

**1. Service-Oriented**
- Business logic in `services/` layer
- Clear separation between read operations (catalog) and write operations (admin)
- Each service handles a specific domain

**2. React Query for Server State**
- TanStack React Query for data fetching, caching, and sync
- Query keys follow pattern: `['domain', 'resource_type', id?]`
- Use React Query DevTools in dev mode for debugging

**3. Form Validation with Zod + React Hook Form**
- All validation schemas in `lib/schemas/`
- Zod for runtime type safety
- React Hook Form for client-side form management

**4. Database Access**
- Prisma ORM with PostgreSQL (Neon)
- Use connection pooling in production
- Prisma client from `lib/db.ts`

**5. Authentication**
- Better Auth for session & account management
- Role-based access control (UserRole: user, subscriber, editor, manager, admin)
- Server-side session validation for API routes

**6. API Structure**
- Versioned REST API: `/api/v1/`
- Organized by domain (resources, lesson-plans, community, admin, auth, bncc)
- Proper HTTP methods and status codes

**7. Background Jobs**
- Inngest for async operations (email sending, cleanup tasks, notifications)
- Job definitions in `lib/inngest/`
- Development: Run `npm run event` in separate terminal

### Data Model Overview

**Core Entities:**
- `User` - Teachers with roles (user, subscriber, editor, manager, admin)
- `Resource` - Educational materials with metadata (grade, subject, BNCC skills)
- `LessonPlan` - User-created lesson plans with content
- `CommunityRequest` - Feature requests from teachers with voting
- `EducationLevel` - Brazilian education structure (early childhood, elementary, secondary)
- `Grade` - Grade levels within education levels
- `Subject` - Subjects taught
- `BnccSkill` - Brazilian curriculum (BNCC) skills mapping
- `Subscription` - Subscription tracking for users
- `LlmUsageLog` - Analytics for AI feature usage

**Key Relationships:**
- Resources have many grades and subjects
- Resources are tied to BNCC skills
- Users have subscriptions and access levels
- Lesson plans belong to users

### External Integrations

**Authentication & User Management**
- Better Auth v1.3.34 for session management

**Database**
- PostgreSQL via Neon (with connection pooling)

**File & Image Management**
- Cloudinary for image hosting and optimization
- next-cloudinary for Next.js integration
- browser-image-compression for client-side compression

**AI & LLM**
- OpenAI API for content generation
- Vercel AI SDK as abstraction layer

**Email**
- Resend - Primary email service
- Nodemailer - Fallback/custom email
- react-email - Email template rendering

**Background Jobs**
- Inngest for async operations

**Notifications**
- web-push for push notifications
- Email via Resend/Nodemailer

**WhatsApp**
- Multiple adapter support in `services/whatsapp/`

**Document Export**
- docx for Word document generation
- @react-pdf/renderer for PDF generation

### UI/UX Stack

- **Framework**: Next.js with React Server Components
- **Styling**: Tailwind CSS 4 with PostCSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod
- **Data Tables**: TanStack React Table
- **Rich Text**: TipTap with markdown support
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Carousels**: Swiper + Embla Carousel
- **Drag & Drop**: @dnd-kit
- **Toasts**: Sonner
- **Theme**: next-themes

### PWA & Offline Support

- Service Worker generated via Workbox during build (`generate-sw.mjs`)
- Offline-first strategy for core features
- PWA utilities in `lib/pwa/`
- Offline pages in `app/offline/`

## Common Development Patterns

### Creating an API Endpoint

Place in `src/app/api/v1/[domain]/route.ts`:

```typescript
// Import services and validation schemas from lib/schemas/
// Use Prisma client from lib/db
// Return JSON responses with proper status codes
// Handle errors with try-catch and return appropriate HTTP status
```

### Adding a New Service

Create in `src/services/[domain]/index.ts`:
- Separate read operations (if complex)
- Separate write operations
- Use Prisma client from `lib/db`
- Export typed functions
- Handle errors and return meaningful messages

### Creating a Form

1. Define Zod schema in `lib/schemas/`
2. Create component using React Hook Form
3. Use form validation schema from lib/schemas
4. Call API endpoint from onSubmit handler

### Using React Query

```typescript
// In client component (use client)
const { data, isLoading, error } = useQuery({
  queryKey: ['resources', type, id],
  queryFn: () => fetch(`/api/v1/resources/${id}`).then(r => r.json()),
})
```

### Database Migrations

After modifying `prisma/schema.prisma`:
```bash
npx prisma migrate dev --name descriptive_name
```
This creates a migration file in `prisma/migrations/`.

## Important Notes

- **Environment Variables**: Database URL, API keys for OpenAI, Cloudinary, etc. are in `.env` (not in repo)
- **TypeScript**: Strict mode enabled - maintain type safety
- **Database**: PostgreSQL connection pooling required for production
- **API Versioning**: Always use `/api/v1/` prefix
- **Server Actions**: Can use Next.js server actions if appropriate, but services layer is preferred for reusability
- **Prisma Queries**: Always validate user permissions/roles before querying sensitive data
- **Rate Limiting**: Check existing implementations in server utilities
- **BNCC**: Brazilian curriculum standards are deeply integrated - understand the education level/grade/subject/skill hierarchy
