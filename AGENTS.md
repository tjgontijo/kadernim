# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.



<claude-mem-context>
# Memory Context

# [kadernim] recent context, 2026-04-20 1:37pm GMT-3

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 32 obs (10,459t read) | 214,137t work | 95% savings

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

Access 214k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>