# Task Tracking — Jidaar Device Management System

> Status: `done` | `in-progress` | `blocked` | `not-started`
> A new agent reads this file second (after README.md) to pick up exactly where the previous session left off.

---

## Phase 0 — Design & Documentation

- [x] Produce all 13 design deliverables — done: ARCHITECTURE.md, README.md, TASKS.md, DECISIONS_LOG.md, KNOWN_ISSUES.md created
- [ ] User approval of design deliverables — **not-started: waiting for explicit go-ahead**

**Acceptance for this phase:** User has reviewed and approved all design deliverables; no unresolved questions remain before implementation begins.

---

## Phase 1 — Project Scaffolding & Database

- [ ] Initialize Next.js project with TypeScript, Tailwind, shadcn/ui — not-started
- [ ] Create Prisma schema (all tables, enums, relations, indexes) — not-started
- [ ] Create initial migration (including raw SQL for partial unique index) — not-started
- [ ] Create Prisma client singleton (`src/lib/prisma.ts`) — not-started
- [ ] Create seed script with full MVP data (30 users, 75 devices, 25 assignments, reference data) — not-started
- [ ] Set up ESLint + Prettier config — not-started
- [ ] Create `.env.example` and `docker-compose.yml` — not-started
- [ ] Verify: `pnpm prisma migrate dev && pnpm prisma db seed` runs clean — not-started

**Acceptance for this phase:** Database is fully seeded, schema matches ARCHITECTURE.md, project builds without errors.

---

## Phase 2 — Authentication & App Shell

- [ ] Set up NextAuth.js with Credentials provider (email + password) — not-started
- [ ] Create auth API routes (login, logout, me, change-password) — not-started
- [ ] Create login page UI — not-started
- [ ] Create auth middleware to protect all /dashboard and /api routes — not-started
- [ ] Create app shell: sidebar navigation + top bar + main content area — not-started
- [ ] Implement light/dark mode toggle with CSS custom properties — not-started
- [ ] Create 404 and error pages — not-started
- [ ] Create RBAC permission helper (`src/lib/permissions.ts`) — not-started
- [ ] Verify: login/logout works, unauthenticated access redirects to login, role-based API protection returns 403 — not-started

**Acceptance for this phase:** User can log in, see the app shell with sidebar, and protected routes enforce authentication + authorization.

---

## Phase 3 — Reference Data CRUD (Shared Pattern)

- [ ] Create reusable reference-data table + form components — not-started
- [ ] Implement Departments CRUD (API + UI) — not-started
- [ ] Implement Locations CRUD (API + UI) — not-started
- [ ] Implement Manufacturers CRUD (API + UI) — not-started
- [ ] Implement Vendors CRUD (API + UI) — not-started
- [ ] Implement deletion blocking with reference count — not-started
- [ ] Implement Device Types CRUD (Settings page) — not-started
- [ ] Implement Device Statuses CRUD (Settings page) — not-started
- [ ] Verify: all reference data can be listed, created, edited, deleted (with blocking) — not-started

**Acceptance for this phase:** All 6 reference data entities are fully manageable through the UI, with deletion blocking when referenced.

---

## Phase 4 — Devices Vertical Slice

- [ ] Device list API with pagination, search, sorting, filtering — not-started
- [ ] Device create/update/delete API with validation — not-started
- [ ] Device list UI: table, filters, search, pagination — not-started
- [ ] Device create/edit slide-over form with field groups — not-started
- [ ] Device detail page (general info + specifications rendering) — not-started
- [ ] Soft-delete device with confirmation dialog — not-started
- [ ] Zod validation schemas for all device fields (MAC, IP, dates, required-by-type) — not-started
- [ ] Activity logging for device CRUD operations — not-started
- [ ] CSV export for devices — not-started
- [ ] Empty state, loading skeleton, error display for device views — not-started
- [ ] Verify: admin can create, view, filter, edit, soft-delete a device end-to-end — not-started

**Acceptance for this phase:** Full device management lifecycle works end-to-end through the UI with proper validation, activity logging, and CSV export.

---

## Phase 5 — Users Vertical Slice

- [ ] User list API with pagination, search, sorting — not-started
- [ ] User create/update/delete API with validation — not-started
- [ ] User list UI — not-started
- [ ] User create/edit slide-over form — not-started
- [ ] User detail page (personal info, current devices, assignment history) — not-started
- [ ] User deactivation blocking when open assignments exist — not-started
- [ ] "Return all devices" flow from user detail page — not-started
- [ ] Activity logging for user operations — not-started
- [ ] Verify: admin can create users, deactivate users (with device return flow) — not-started

**Acceptance for this phase:** Full user management works, deactivation properly handles open assignments.

---

## Phase 6 — Assignments Vertical Slice

- [ ] Assignment list API with pagination and filters (status, user, device, overdue) — not-started
- [ ] Assign API (atomic: create assignment + set device status) — not-started
- [ ] Return API (atomic: close assignment + set device status) — not-started
- [ ] Transfer API (atomic: close current + open new assignment) — not-started
- [ ] Overdue query endpoint — not-started
- [ ] Assignment list UI with overdue badges/highlights — not-started
- [ ] Assign dialog (select device + user + dates) — not-started
- [ ] Return dialog (return date, condition, notes) — not-started
- [ ] Transfer dialog (select new user + notes) — not-started
- [ ] Assign/Return buttons on device detail and user detail pages — not-started
- [ ] Activity logging for all assignment operations — not-started
- [ ] CSV export for assignments — not-started
- [ ] Verify: assign → return → transfer cycle works; concurrent assign blocked; maintenance-while-assigned works — not-started

**Acceptance for this phase:** Full assignment lifecycle (assign, return, transfer, overdue detection) works with atomic status transitions and concurrent-assignment protection.

---

## Phase 7 — Dashboard

- [ ] Dashboard stats API (aggregate queries for KPIs) — not-started
- [ ] Dashboard charts API (devices by type, devices by status) — not-started
- [ ] Recent activity API — not-started
- [ ] KPI cards component (total, available, assigned, maintenance, retired, warranty expiring) — not-started
- [ ] Devices by type bar chart — not-started
- [ ] Devices by status donut chart — not-started
- [ ] Recent activity table with "View all" link — not-started
- [ ] Verify: all dashboard numbers come from real DB queries, charts render correctly — not-started

**Acceptance for this phase:** Dashboard displays accurate real-time metrics and charts from the database.

---

## Phase 8 — Global Search

- [ ] Global search API (search across devices and users) — not-started
- [ ] Search input in top bar with dropdown results (grouped by entity type) — not-started
- [ ] Click result navigates to entity detail page — not-started
- [ ] Verify: search returns matching devices and users, grouped correctly — not-started

**Acceptance for this phase:** Global search works from the top bar, returning relevant results across entities.

---

## Phase 9 — File Attachments

- [ ] S3 client configuration (configurable endpoint, bucket) — not-started
- [ ] Attachment upload API (device only for MVP) — not-started
- [ ] Attachment delete API (removes from S3 and DB) — not-started
- [ ] Signed URL generation for attachment retrieval — not-started
- [ ] Attachment upload UI on device detail page — not-started
- [ ] Thumbnail grid display — not-started
- [ ] Verify: upload file → see thumbnail → delete file → removed from S3 — not-started

**Acceptance for this phase:** Device attachments can be uploaded, displayed, and deleted via S3-compatible storage.

---

## Phase 10 — Testing & Polish

- [ ] Unit tests: Zod validation schemas — not-started
- [ ] Unit tests: permission checks — not-started
- [ ] Integration tests: device CRUD API — not-started
- [ ] Integration tests: user CRUD API — not-started
- [ ] Integration tests: assignment workflow (assign, return, transfer, concurrent guard) — not-started
- [ ] Integration tests: auth enforcement (401, 403) — not-started
- [ ] Integration tests: reference data deletion blocking — not-started
- [ ] E2E test: full device lifecycle (create → assign → return → retire) — not-started
- [ ] Final polish: loading states, empty states, error states, toast notifications — not-started
- [ ] Final lint + typecheck pass — not-started
- [ ] Verify: all tests pass, no console errors on happy path — not-started

**Acceptance for this phase:** All tests pass, UI is polished, no runtime errors on core workflows.

---

## Phase 11 — Docker & Deployment

- [ ] Create optimized Dockerfile (multi-stage build) — not-started
- [ ] Verify full docker-compose stack (app + PostgreSQL + MinIO) works — not-started
- [ ] Verify migrations + seed run inside container — not-started
- [ ] Update README.md with final setup instructions — not-started
- [ ] Final review of all handoff files (README, ARCHITECTURE, TASKS, DECISIONS_LOG, KNOWN_ISSUES) — not-started

**Acceptance for this phase:** `docker-compose up` starts a fully functional system from a clean checkout.

---

## Next Task

After user approval of design deliverables (Phase 0): **Begin Phase 1 — initialize the Next.js project, create the Prisma schema, run migrations, and seed the database.**
