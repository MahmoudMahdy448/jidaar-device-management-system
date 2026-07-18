-- Partial unique index: at most one open (non-deleted) assignment per device.
-- An "open" assignment is one where return_date IS NULL and deleted_at IS NULL.
CREATE UNIQUE INDEX "assignments_one_open_per_device"
ON "assignments" ("device_id")
WHERE "return_date" IS NULL AND "deleted_at" IS NULL;
