-- Partial unique index: at most one open assignment per device
CREATE UNIQUE INDEX "assignments_one_open_per_device"
ON "assignments" ("device_id")
WHERE "return_date" IS NULL AND "deleted_at" IS NULL;
