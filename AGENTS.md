# AGENTS.md

You are a TypeScript developer experienced with the Mastra framework. You build AI agents, tools, workflows, and scorers. You follow strict TypeScript practices and always consult up-to-date Mastra documentation before making changes.

## CRITICAL: Load `mastra` skill

**BEFORE doing ANYTHING with Mastra, load the `mastra` skill FIRST.** Never rely on cached knowledge as Mastra's APIs change frequently between versions. Use the skill to read up-to-date documentation from `node_modules`.

## Project Overview

This is a **Mastra** project written in TypeScript. Mastra is a framework for building AI-powered applications and agents with a modern TypeScript stack. The Node.js runtime is `>=22.13.0`.

## Commands

```bash
npm run dev # Start Mastra Studio at localhost:4111 (long-running, use a separate terminal)
npm run build # Build a production-ready server
```

## Project Structure

| Folder                 | Description                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/mastra`           | Entry point for all Mastra-related code and configuration.                                                                               |
| `src/mastra/agents`    | Define and configure your agents - their behavior, goals, and tools.                                                                     |
| `src/mastra/workflows` | Define multi-step workflows that orchestrate agents and tools together.                                                                  |
| `src/mastra/tools`     | Create reusable tools that your agents can call                                                                                          |
| `src/mastra/mcp`       | (Optional) Implement custom MCP servers to share your tools with external agents                                                         |
| `src/mastra/scorers`   | (Optional) Define scorers for evaluating agent performance over time                                                                     |
| `src/mastra/public`    | (Optional) Contents are copied into the `.build/output` directory during the build process, making them available for serving at runtime |

### Top-level files

Top-level files define how your Mastra project is configured, built, and connected to its environment.

| File                  | Description                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/mastra/index.ts` | Central entry point where you configure and initialize Mastra.                                                    |
| `.env.example`        | Template for environment variables - copy and rename to `.env` to add your secret [model provider](/models) keys. |
| `package.json`        | Defines project metadata, dependencies, and available npm scripts.                                                |
| `tsconfig.json`       | Configures TypeScript options such as path aliases, compiler settings, and build output.                          |

## Boundaries

### Always do

- Load the `mastra` skill before any Mastra-related work
- Register new agents, tools, workflows, and scorers in `src/mastra/index.ts`
- Use schemas for tool inputs and outputs
- Run `npm run build` to verify changes compile

### Never do

- Never commit `.env` files or secrets
- Never modify `node_modules` or Mastra's database files directly
- Never hardcode API keys (always use environment variables)

## Resources

- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Mastra .well-known skills discovery](https://mastra.ai/.well-known/skills/index.json)


<claude-mem-context>
# Memory Context

# [kadernim] recent context, 2026-04-23 2:40pm GMT-3

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (17,170t read) | 1,131,716t work | 98% savings

### Apr 20, 2026
220 1:10p 🔵 Build Error — Seed File `@db` Module Alias Not Resolvable by Next.js TypeScript Build
221 1:12p 🔴 pedagogy-service.ts — Step Type Enum Narrowing and null→undefined Duration Fix
222 " 🔴 Seed Files Fixed — `@db` Import Alias Changed to `@db/client`
223 " 🔴 Email Templates — Missing `Font` Import Added to otp-email.tsx; pix-failure-email.tsx Also Affected
224 " ✅ pedagogy-service.ts Renamed to resource-pedagogical-service.ts
### Apr 21, 2026
225 9:16a 🔵 Cloudinary Upload Failing — Missing API Key at Runtime
227 9:17a 🔴 Image Upload Route — Fixed Cloudinary Config by Using Shared Client
229 " 🔵 TypeScript Build — Only One Error Remaining in Test File
231 9:18a 🔵 Kadernim Env File Layout — CLOUDINARY_URL Confirmed in .env
234 9:20a 🔵 Resource thumbUrl Architecture — Upload Route Feeds resource-details-form.tsx
235 " 🟣 Thumbnail Removal — Now Uses DeleteConfirmDialog Instead of Instant X Button
### Apr 22, 2026
303 1:13p ⚖️ Kadernim — Nova Feature: Tela de Diretrizes com Consulta BNCC
304 " 🔵 Kadernim Prisma Schema — BnccSkill Já Conectada a EducationLevel, Grade e Subject
308 1:14p 🔵 Kadernim BnccSkill — Modelo Completo com Campos Pedagógicos Ricos
309 " 🔵 Kadernim AppSidebar — Menu Atual Não Tem Item "Diretrizes"
315 1:15p 🔵 Kadernim BNCC Search API — Endpoint Atual é Admin-Only, Bloqueio para Diretrizes
316 " 🔵 Kadernim Dashboard — Rotas Existentes e Padrões de Página Confirmados para Diretrizes
327 1:28p 🔵 Kadernim BNCC Architecture — Full Stack Inventory for Diretrizes Feature
328 " 🔵 updateResourceService Silent Bug — bnccCodes Ignored on Edit
329 " ✅ PRD docs/PRD/diretrizes-bncc-consulta.md — Created with 16 Sections
330 6:02p 🔵 Kadernim — googleDriveUrl Field Exists in Both Create and Edit Forms
331 " 🔴 TypeScript Build Error Fixed — optionalNullableUrl z.preprocess Broke Resolver Type
332 " 🟣 ResourceFilesManager — PDF Preview Images Now Shown Inline in File Cards
333 " 🔄 Edit Page Restructured — ResourceFilesManager Moved Inside ResourceDetailsForm via extraSections Prop
334 " 🟣 File Service — Per-File-Image CRUD Functions Added
335 " ✅ resource-details-form.tsx — Nullable URL Fields Default to null Instead of Empty String
342 6:08p 🔵 Kadernim — `seedResourceFiles` Architecture Confirmed — Drive → R2 + Cloudinary Pipeline
343 6:16p 🟣 ResourceFilesManager — `allowGenerateNextPreview` Prop Gates "Generate Next Preview" Button
### Apr 23, 2026
347 10:27a 🔵 Kadernim — Subjects Admin Page Architecture Confirmed
349 " 🔵 Kadernim — Subject Color Field Already in Prisma Schema, Missing in App Layer
350 10:29a 🔵 Kadernim — Subject Color/TextColor Fields Confirmed in Prisma; Full Change Scope Mapped
351 " 🟣 Subject Color Field Added to Schema and Type Layer
353 " 🟣 Subject Color Utility Layer Added — Service Selects Color, Color Helpers Created
356 " 🟣 SubjectForm — Color Picker Added with Native Input + HEX Text Input
358 2:03p 🔴 AI Costs Page — "Consumo por Usuário" Table Now Fills Available Vertical Space
359 " 🟣 AI Costs — "Por Modelo" Section Replaced with Recharts Donut Chart
360 " 🔄 toUsd Helper — Configurable Decimal Precision Added
361 " 🔄 DashboardHeader Breadcrumb — Smart Nested Label Resolution
362 " ✅ Subjects Page Moved to /admin/subjects Route
363 " 🔵 Build Error — `resourceAccess` Missing from Prisma UserCountOutputTypeSelect
366 2:04p ✅ Old /subjects Route Deleted — Disciplinas Exclusively at /admin/subjects
367 " 🔵 Kadernim Users System — resourceAccess Count Field Architecture Confirmed
368 2:06p 🟣 useInfiniteDataTable — replaceFilters Method Added
369 " 🔄 Admin Users Page — Full Rewrite to PageScaffold + Dialog Filter Pattern
370 " 🔄 UsersTableVirtuoso — Window Scroll + Hover-Reveal Action Buttons
375 2:07p 🔄 Admin Users Loading Skeleton — Replaced CrudPageSkeleton with Column-Matched Custom Skeleton
377 2:09p 🔵 Kadernim Users System — Full Architecture Confirmed
379 2:11p 🟣 GET /api/v1/admin/users/[id] — New Single-User Endpoint Added
380 " 🔵 Prisma Relation Name Mismatch — resourceAccess vs userInteractions
382 2:14p 🔄 user-create-page-client.tsx — PageScaffold Replaced with Brand-Styled Custom Layout

Access 1132k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>