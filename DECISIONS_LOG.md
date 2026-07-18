# Decisions Log — Jidaar Device Management System

> Append-only chronological log. Newest entries at the bottom. Each entry records what was decided, why, and any rejected alternatives.

---

## Session 1 — Initial Architecture & Design

**Date:** 2026-07-18
**Phase:** Design (Phase 0)

### Decisions Made

1. **Next.js full-stack monolith** (not separate Express + Next.js)
   - **Why:** Single TypeScript project eliminates type-syncing across API boundary. Route Handlers provide clean REST API. Single Docker container for deployment. At 2–5 concurrent users, coupling is not a concern.
   - **Rejected:** Express + Next.js monorepo (added complexity, type-sync overhead). NestJS (over-engineered for this scale).

2. **PostgreSQL** as database
   - **Why:** JSONB support for extensible device-type pattern. Partial unique indexes for concurrent-assignment guard. Battle-tested, portable.
   - **Rejected:** SQLite (no JSONB, limited concurrency). MySQL (inferior JSON support).

3. **Prisma** as ORM
   - **Why:** Type-safe database access with auto-generated TypeScript types. Excellent Next.js integration. Declarative schema with migrations.
   - **Rejected:** Drizzle (less mature for complex relations). TypeORM (poorer DX).

4. **shadcn/ui** for component library
   - **Why:** Built on Radix UI (accessible by default). Tailwind-based. You own the component source.
   - **Rejected:** MUI (heavy, opinionated). Chakra (less aligned with Linear/Stripe design goal).

5. **JSONB `specifications` column** for extensible device types (not EAV)
   - **Why:** Simpler queries, PostgreSQL JSONB supports GIN indexing, EAV is over-engineered for 75–150 devices. New device type = new data row; the JSONB column holds whatever fields are relevant.
   - **Rejected:** EAV pattern (query complexity, JOIN overhead at this scale).

6. **JWT-based sessions** via NextAuth.js (Auth.js v5)
   - **Why:** Stateless, no session table needed. Simple setup. Acceptable trade-off for 2–5 admin users.

7. **Slide-over panels** for all create/edit forms (not modals, not full-page forms)
   - **Why:** Consistent UX pattern, keeps context visible, works well for forms with multiple field groups.

8. **Pure DATE type** for purchase_date, warranty_expiration, assignment dates (no time component)
   - **Why:** These are business dates, not timestamps. TIMEZONED timestamps used only for audit fields (created_at, updated_at, deleted_at).

9. **No `assigned_user_id` denormalization** on devices table
   - **Why:** Assignment table is the source of truth. Current assignment is computed via a query. Avoids inconsistency risk from denormalization.

10. **Vitest** for unit/integration tests, **Playwright** for E2E
    - **Why:** Vitest: fast, TypeScript-native, Jest-compatible. Playwright: reliable cross-browser, better CI support than Cypress.

11. **HSL CSS custom properties** for theme tokens (light/dark mode)
    - **Why:** Industry standard, works with Tailwind, supports system preference detection, easy to customize.

12. **Consistent color mapping** for status badges across entire app
    - **Why:** Prevents visual inconsistency. Green=available, Blue=assigned, Amber=maintenance, Gray=retired, Red=error. Defined once in ARCHITECTURE.md, never deviated from.
