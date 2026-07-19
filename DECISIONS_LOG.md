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

---

## Session 2 — Jidaar Brand UI Re-theme

**Date:** 2026-07-18
**Phase:** Phase 12 (UI Re-theme)

### Decisions Made

1. **IBM Plex Sans as primary UI font** (replacing Geist)
   - **Why:** IBM Plex Sans has a more technical/industrial character appropriate for a construction company's asset management tool. Weights 400/500 for body, 700 for logo wordmark.
   - **Rejected:** Inter (too generic), Geist (default, no brand personality).

2. **IBM Plex Mono for technical identifiers only**
   - **Why:** Mono font on asset IDs, serial numbers, IP/MAC addresses, and employee IDs improves scannability of machine-readable codes without polluting prose text.
   - **Scope limitation:** Not applied to names, notes, or free-text fields.

3. **Brand orange `#F26522` as single accent color**
   - **Why:** Matches Jidaar's logo wordmark color. Used exclusively for: active sidebar nav, primary buttons, focus/ring states, warranty-expiring KPI highlight. One accent per view prevents visual noise.
   - **Rejected:** Using orange for sidebar background (too aggressive); using raw `#F26522` as text color (fails WCAG contrast on light backgrounds).

4. **Warranty warning tint: `#FDECD9` bg / `#C2500F` text**
   - **Why:** Raw brand orange (`#F26522`) fails contrast on light backgrounds. `#C2500F` is a darker step that achieves ~6.2:1 contrast ratio, passing WCAG AA. Background `#FDECD9` is a warm tint that signals attention without screaming.

5. **Sidebar: dark charcoal `#1E1E1F` background**
   - **Why:** Dark sidebar is standard in admin UIs (Linear, Vercel, etc.). Charcoal keeps the sidebar visually distinct from the warm-paper page background without competing with the brand orange accent.

6. **Border radius tightened to `0.4rem` (~6px)**
   - **Why:** Default shadcn radius (0.625rem = 10px) feels soft/rounded. Tighter radius reads more precise/technical, consistent with the construction/industrial brand.

7. **Page background `#FAFAF7` (warm paper)**
   - **Why:** Pure white (`#FFFFFF`) feels clinical. The slight warm tint matches Jidaar's brand warmth while maintaining excellent readability. Cards remain pure `#FFFFFF` for surface contrast.

8. **Status badge colors preserved unchanged**
   - **Why:** Status colors (Available=green, Assigned=blue, etc.) are semantic and pre-date the brand pass. Recoloring them to match the brand orange would break the established visual language.

---

## Session 3 — Code Audit, Security & Reliability

**Date:** 2026-07-19
**Phase:** Phase 13 (Code Audit & Security Hardening)

### Decisions Made

1. **Defense-in-depth RBAC: middleware + route handler**
   - **Why:** Middleware enforces RBAC globally, but a bug or misconfigured route could bypass it. `requirePermission()` in route handlers is a second enforcement layer. Cost is one extra DB call per request (session lookup).
   - **Rejected:** Single enforcement point in middleware only (violates defense-in-depth principle).

2. **In-memory login rate limiter** (not Redis-backed)
   - **Why:** For 2–5 admin users, in-memory is sufficient. Resets on server restart (acceptable). No Redis dependency to manage.
   - **Rejected:** Redis-backed rate limiter (operational overhead not justified at this scale). Database-backed (adds latency to auth path).

3. **Partial unique index for concurrent assignment guard** (database-level, not just application)
   - **Why:** Application-level locks can be bypassed by direct DB access or race conditions. A partial unique index on `assignments(device_id) WHERE return_date IS NULL AND deleted_at IS NULL` is the single source of truth. Prisma's P2002 error code is caught and translated to a user-friendly 409.
   - **Rejected:** Application-only `SELECT ... FOR UPDATE` (not sufficient under all concurrency scenarios).

4. **Sentry for error monitoring** (not custom logging solution)
   - **Why:** Sentry provides structured error tracking with context, stack traces, and alerting out of the box. Free tier sufficient for this scale. No need to build custom log aggregation.
   - **Rejected:** Custom console.error + log file (no alerting, no grouping, no context).

5. **Server-side search with debounce** (not load-all-then-filter)
   - **Why:** The `pageSize=500` pattern broke when devices exceeded 100. Server-side search scales to any dataset size. 300ms debounce prevents excessive API calls while typing.
   - **Rejected:** Load-all-then-filter (doesn't scale, breaks with API page size limits).

6. **PrismaPg adapter with Supabase connection pooler** (transaction mode on port 6543)
   - **Why:** Supabase's managed PgBouncer handles connection pooling. Direct connection (port 5432) reserved for migrations only.
   - **Rejected:** Direct connection in production (exhausts Supabase connection limits at scale).

---

## Session 4 — Signed Assignment Form Attachments

**Date:** 2026-07-19
**Phase:** Phase 14 (Signed Assignment Form Attachments)

### Decisions Made

1. **PostgreSQL BYTEA for file storage** (replacing S3)
   - **Why:** MinIO was never installed; S3 dependency added operational complexity unnecessary at this scale. Storing file bytes directly in PostgreSQL eliminates the external dependency. Attachment volume (<100 files, <10MB each) is well within PostgreSQL's comfortable range.
   - **Rejected:** S3/MinIO (requires separate service, more configuration, more failure modes). PostgreSQL Large Objects (deprecated interface, harder to work with than BYTEA).
   - **Trade-off:** Increases DB backup size. Acceptable for current scale; can migrate to S3 later by replacing `content BYTEA` with `s3_key VARCHAR`.

2. **Polymorphic attachment model** via nullable `device_id` + `assignment_id`
   - **Why:** Prisma doesn't support polymorphic relations. Two nullable FKs with application-level validation (exactly one must be set) is the simplest approach that supports both device photos and assignment forms without schema duplication.
   - **Rejected:** Separate `device_attachments` and `assignment_attachments` tables (schema duplication, code duplication).

3. **Attachment type enum** (DEVICE_PHOTO, SIGNED_ASSIGNMENT_FORM, OTHER)
   - **Why:** Allows filtering and conditional display without string matching. Extensible — new types can be added to the enum without changing query logic.

4. **Direct file serving from DB** via `/api/attachments/[id]/view`
   - **Why:** No signed URLs needed since files are in the database. Response includes correct `Content-Type` and `Content-Disposition` headers for browser rendering.

---

## Session 5 — Device Create & Assign + README Rewrite

**Date:** 2026-07-19
**Phase:** Phase 15 (Device Create & Assign + README)

### Decisions Made

1. **Device creation with inline assignment** (optional `assignedUserId` field)
   - **Why:** Workflow friction — creating a device then separately assigning it requires two steps and two page navigations. Adding an optional user select that appears when status is "Assigned" streamlines the common case of procuring and immediately assigning a device.
   - **Rejected:** Dedicated "Create & Assign" wizard (over-engineered for two fields). Mandatory assignment on create (breaks the workflow for devices that go to inventory first).
   - **Implementation:** `assignedUserId` is optional in `DeviceSchema`. When set, the API creates an assignment record in the same `$transaction` as the device. User is validated (exists, ACTIVE). `assignedById` is set from the current session.

2. **No-Docker README as primary setup path**
   - **Why:** Docker adds complexity (Docker Desktop install, resource usage, Windows/macOS performance overhead) that discourages quick local setup. PostgreSQL is straightforward to install natively. README now provides step-by-step instructions for Windows, macOS, and Linux.
   - **Rejected:** Keeping Docker as the primary path (adds unnecessary dependency for local dev). Removing Docker entirely (useful for CI/CD and team onboarding).
