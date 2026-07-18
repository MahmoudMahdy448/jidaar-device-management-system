import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export type EntityType = "device" | "user" | "assignment";
export type ActionType =
  | "created"
  | "updated"
  | "deleted"
  | "assigned"
  | "returned"
  | "transferred"
  | "status_changed";

interface LogActivityParams {
  entityType: EntityType;
  entityId: string;
  action: ActionType;
  actorId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorId: params.actorId ?? null,
        changes: (params.changes as Prisma.InputJsonValue) ?? undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export function computeChanges(
  oldRecord: Record<string, unknown>,
  newRecord: Record<string, unknown>,
  fieldsToTrack: string[]
): Record<string, { old: unknown; new: unknown }> | undefined {
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  let hasChanges = false;

  for (const field of fieldsToTrack) {
    const oldVal = oldRecord[field];
    const newVal = newRecord[field];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[field] = { old: oldVal, new: newVal };
      hasChanges = true;
    }
  }

  return hasChanges ? changes : undefined;
}
