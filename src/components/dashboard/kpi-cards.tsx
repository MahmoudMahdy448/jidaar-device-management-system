"use client";

import useSWR from "swr";
import {
  Monitor,
  CheckCircle2,
  UserCheck,
  Wrench,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error?.message || "Failed to fetch");
  return json;
};

interface Stats {
  totalDevices: number;
  availableDevices: number;
  assignedDevices: number;
  maintenanceDevices: number;
  retiredDevices: number;
  warrantyExpiringSoon: number;
}

const cards = [
  { key: "totalDevices", label: "Total Devices", icon: Monitor, color: "text-primary" },
  { key: "availableDevices", label: "Available", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "assignedDevices", label: "Assigned", icon: UserCheck, color: "text-blue-600 dark:text-blue-400" },
  { key: "maintenanceDevices", label: "Under Maintenance", icon: Wrench, color: "text-orange-600 dark:text-orange-400" },
  { key: "retiredDevices", label: "Retired", icon: Trash2, color: "text-muted-foreground" },
  { key: "warrantyExpiringSoon", label: "Warranty Expiring Soon", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400" },
] as const;

export function KpiCards() {
  const { data, isLoading } = useSWR<Stats>("/api/dashboard/stats", fetcher, {
    revalidateOnFocus: false,
  });

  const stats = data ?? {
    totalDevices: 0,
    availableDevices: 0,
    assignedDevices: 0,
    maintenanceDevices: 0,
    retiredDevices: 0,
    warrantyExpiringSoon: 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isWarning = card.key === "warrantyExpiringSoon";
        return (
          <div
            key={card.key}
            className={`flex flex-col gap-1 rounded-xl border p-4 ${
              isWarning && (stats.warrantyExpiringSoon ?? 0) > 0
                ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`size-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {isLoading ? "—" : stats[card.key]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
