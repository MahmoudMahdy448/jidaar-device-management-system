# Known Issues — Jidaar Device Management System

> Track broken, incomplete, or deliberately deferred items with workarounds. A new agent checks here first before assuming unexpected behavior is new.

---

## Deferred Items

- **Unit test type errors:** `tests/unit/validations.test.ts` has pre-existing Zod v4 compatibility issues (e.g., `UserSchema` not exported, `delete` on non-optional fields). Not blocking runtime; tests need Zod v4 migration to pass.

- **P3.4 — Searchable reference dropdowns:** Command/Popover comboboxes deferred. The assign and transfer dialogs now use debounced server-side search, which addresses the core scalability concern. Full combobox UI is lower priority.

## Active Notes

- **Device/User form validation fix applied:** `src/lib/validations.ts` now uses `z.preprocess` to convert empty strings (`""`) to `null` before Zod validation, fixing the issue where HTML `<input>` elements produced empty strings instead of `null` for optional/nullable fields. The `specifications` field changed from `.optional().nullable()` to just `.optional()` to avoid Prisma Json type incompatibility with `null`.

- `@sentry/cli` build script was approved via `pnpm approve-builds`. If `node_modules` is deleted, re-run `pnpm approve-builds` after install.
- Sentry is configured but inactive without `SENTRY_DSN`. In development, errors are only logged to console. Set `SENTRY_DSN`, `SENTRY_ORG`, and `SENTRY_PROJECT` env vars to enable production error tracking.
