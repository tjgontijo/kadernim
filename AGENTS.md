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

# [kadernim] recent context, 2026-04-22 1:27pm GMT-3

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 44 obs (14,812t read) | 591,727t work | 97% savings

### Apr 20, 2026
164 12:50p 🔵 scripts/clear-r2.ts Not Found in Git History — Kadernim
165 12:51p 🔵 Kadernim scripts/ Directory — clear-r2.ts Missing but Referenced in reset-db.sh
166 " 🔵 Kadernim R2 Client Architecture — Full Inventory for clear-r2.ts Creation
168 " 🟣 scripts/clear-r2.ts Created — Cloudflare R2 Bucket Cleanup Script
170 12:52p 🔴 Fix TypeScript Import Errors in scripts/clear-r2.ts — node:fs and node:path
172 " ✅ scripts/clear-r2.ts Passes TypeScript Check — Ready to Commit
174 12:54p 🔵 Kadernim Build Failure — TypeScript Error in BNCC Search Route
175 " 🔴 Fix TypeScript Role Check in BNCC Search Route
177 12:55p 🔵 Build Failure — `createResourceService` Input Type Mismatch: Missing `bnccCodes`
179 12:56p 🔵 Root Cause: `createAdminResourceCollectionHandlers` Input Type Missing `bnccCodes`, `googleDriveUrl`, `pedagogicalContent`
181 " 🔴 Fix Handler Config Types in `route-support.ts` — Replace Inline Types with Schema-Derived Types
185 12:59p 🔵 Kadernim UUID Generation — Client-Side, Not Database-Generated
187 1:02p 🔵 Kadernim pedagogicalContent — Full Codebase Usage Map
188 " 🔵 detail-service.ts — Hybrid Relational + JSON Fallback for pedagogicalContent
191 1:03p 🔵 Schema Mismatch — admin-resource-schemas vs pedagogical-schemas Incompatibility
196 " 🔴 Pedagogical Schema — id Field Made Optional Across All Schemas and Components
197 " 🔴 create-service.ts — pedagogicalContent Written to Relational Tables Instead of JSONB
199 1:04p 🔴 update-service.ts — Added pedagogicalContent Handling via Relational Delete-and-Recreate
200 " 🔄 pedagogy-service.ts — Legacy JSONB Fallback and Materials JSONB Write Removed
203 " 🔴 detail-service.ts — JSONB Fallback Removed, Relational-Only pedagogicalContent Assembly
206 1:06p 🔵 Build Error — `selectedGrades` Possibly Undefined in resource-details-form.tsx:462
207 1:07p 🔄 pedagogical-schemas.ts — Materials Schema Removed to Match Relational-Only Architecture
210 " 🔴 Materials UI Fully Removed from ResourcePedagogyEditor
211 " 🔴 resource-details-form.tsx — selectedGrades Nullish Coalescing Fix
212 1:09p 🔴 resource-details-form.tsx — Two More TypeScript Build Errors Fixed
213 " 🔴 create-service.ts — Stale `externalId` Destructure Removed
216 1:10p 🔴 create-service.ts — thumbUrl Removed (Field Not in Prisma ResourceCreateInput)
220 " 🔵 Build Error — Seed File `@db` Module Alias Not Resolvable by Next.js TypeScript Build
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

Access 592k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>