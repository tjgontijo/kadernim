# Implementation Plan - Community Requests (PRD 12)

This document outlines the phased implementation of the Community Requests feature, integrating the "Lixo Zero" deletion policy and the preliminary Event Engine triggers.

## Phase 1: Foundation & Data Modeling
- **Goal**: Establish the database structure and basic file handling.
- [ ] Update `prisma/schema.prisma` with `CommunityRequest`, `CommunityRequestVote`, and `CommunityRequestReference`.
- [ ] Run Prisma migration and generate client.
- [x] Implement `CloudinaryService` utility for handling temporary reference images.
- [x] Create basic Server Actions (or API Services) for:
    - `getCommunityRequests` (with pagination and filters).
    - `createCommunityRequest` (including author validation).

## Phase 2: Core Business Logic (Backend)
- **Goal**: Implement the rules that drive the community participation.
- [x] **Voting Logic**:
    - Validation of 5 votes per user/month.
    - Atomically increment `voteCount` and create `CommunityRequestVote`.
- [x] **Author Restrictions**:
    - Enforce 1 request per user/month.
    - Validation for "User must vote at least once before requesting".
- [x] **Event Bus Bridge**:
    - Create `src/lib/events/emit.ts` as the central dispatcher.
    - Add triggers: `REQUEST_CREATED`, `REQUEST_VOTED`.

## Phase 3: Automation & Survival Funnel (Cron Jobs)
- **Goal**: Implement the monthly "Selection Day" and cleanup tasks.
- [x] **Monthly Processing (`/api/cron/community-month-end`)**:
    - Logic for Top 10 (Selection).
    - Logic for Top 30 (Survival/SurvivedMonths).
    - Logic for Deletion (0 votes, P31+, 3 Strikes).
- [x] **Cleanup Job (`/api/cron/community-cleanup`)**:
    - Removal of `unfeasible` requests older than 30 days.
    - Cloudinary sync (delete orphaned images).

## Phase 4: Frontend - Main Experience (Client Side)
- **Goal**: Create the "Duolingo-style" gamified interface.
- [ ] **Main Page (`/community`)**:
    - Responsive layout (Mobile-first).
    - `VoteProgress` component (dots indicator).
    - Request list with inline voting cards.
- [ ] **Creation Wizard**:
    - Multi-step drawer (`CrudEditDrawer` pattern).
    - Subject/Grade selection.
    - Image upload with preview.
- [ ] **Animations**:
    - Confetti on vote.
    - Unlock animation for the "Suggest" button.

## Phase 5: Frontend - Admin & Moderation
- **Goal**: Build tools for the team to evaluate and produce materials.
- [ ] **Admin Dashboard (`/admin/community`)**:
    - Filterable list of selected requests.
    - "Approve" vs "Unfeasible" workflow.
    - Link produced Resource to Community Request.

## Phase 6: Communication & Polish
- **Goal**: Wrap up with notifications and final UX touches.
- [ ] **Email Dispatcher**:
    - Simple integration with Resend/Postmark.
    - Templates: "Lack of Support", "Unfeasible", "Selected".
- [ ] **Empty States & Feedback**:
    - Page for "No requests this month yet".
    - Loading skeletons.
