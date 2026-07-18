"use client";

import useSWR from "swr";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error?.message || "Failed to fetch");
  return json;
};

interface ActivityEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  entityName: string;
  actor: string;
  timestamp: string;
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentActivity() {
  const { data, isLoading } = useSWR("/api/dashboard/recent-activity", fetcher, {
    revalidateOnFocus: false,
  });

  const activities: ActivityEntry[] = data?.data ?? [];

  return (
    <div className="rounded-xl border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
        </div>
        <Link
          href="/assignments"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : activities.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No recent activity
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Actor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(entry.timestamp)}
                </TableCell>
                <TableCell className="text-sm">{formatAction(entry.action)}</TableCell>
                <TableCell className="text-sm">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {entry.entityType}
                  </span>{" "}
                  <span className="text-sm">{entry.entityName}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.actor}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
