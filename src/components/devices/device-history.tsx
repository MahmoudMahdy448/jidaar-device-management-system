"use client";

import { useDeviceActivity } from "@/hooks/use-devices";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  ArrowRightLeft,
  RotateCcw,
  CircleDot,
} from "lucide-react";

interface ActivityLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, { old: unknown; new: unknown }> | null;
  actor?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    created: "Created",
    updated: "Updated",
    deleted: "Deleted",
    assigned: "Assigned",
    returned: "Returned",
    transferred: "Transferred",
    status_changed: "Status Changed",
  };
  return map[action] ?? action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function getActionIcon(action: string) {
  switch (action) {
    case "created":
      return <Plus className="size-3.5" />;
    case "deleted":
      return <Trash2 className="size-3.5" />;
    case "assigned":
      return <CircleDot className="size-3.5" />;
    case "returned":
      return <RotateCcw className="size-3.5" />;
    case "transferred":
      return <ArrowRightLeft className="size-3.5" />;
    default:
      return <Pencil className="size-3.5" />;
  }
}

function getActionColor(action: string): string {
  switch (action) {
    case "created":
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400";
    case "deleted":
      return "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400";
    case "assigned":
      return "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400";
    case "returned":
      return "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400";
    case "transferred":
      return "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function TimelineEntry({ log }: { log: ActivityLog }) {
  const changes = log.changes as Record<string, { old: unknown; new: unknown }> | null;

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border last:hidden" />

      <div
        className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${getActionColor(log.action)}`}
      >
        {getActionIcon(log.action)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {formatAction(log.action)}
          </span>
          {log.entityType === "assignment" && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              Assignment
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(log.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {log.actor && (
          <p className="text-xs text-muted-foreground mt-0.5">
            by {log.actor.firstName} {log.actor.lastName}
          </p>
        )}

        {changes && Object.keys(changes).length > 0 && (
          <div className="mt-2 rounded-md border bg-muted/50 p-2.5">
            {Object.entries(changes).map(([field, { old: oldVal, new: newVal }]) => (
              <div key={field} className="flex items-start gap-2 text-xs py-0.5">
                <span className="text-muted-foreground shrink-0 min-w-[100px]">
                  {formatFieldName(field)}
                </span>
                <span className="text-destructive line-through break-all">
                  {formatValue(oldVal)}
                </span>
                <span className="text-muted-foreground shrink-0">→</span>
                <span className="text-foreground break-all">
                  {formatValue(newVal)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DeviceHistory({ deviceId }: { deviceId: string }) {
  const { activityLogs, isLoading } = useDeviceActivity(deviceId);

  if (isLoading) {
    return (
      <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
        Loading history...
      </div>
    );
  }

  if (!activityLogs || activityLogs.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <Activity className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">
          Activity Timeline
        </h3>
        <span className="text-xs text-muted-foreground">
          ({activityLogs.length} {activityLogs.length === 1 ? "event" : "events"})
        </span>
      </div>
      <div className="ml-1">
        {activityLogs.map((log: ActivityLog) => (
          <TimelineEntry key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
