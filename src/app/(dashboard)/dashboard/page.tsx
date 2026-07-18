"use client";

import dynamic from "next/dynamic";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";

const DevicesByTypeChart = dynamic(
  () =>
    import("@/components/dashboard/devices-by-type-chart").then(
      (m) => m.DevicesByTypeChart
    ),
  { ssr: false }
);

const DevicesByStatusChart = dynamic(
  () =>
    import("@/components/dashboard/devices-by-status-chart").then(
      (m) => m.DevicesByStatusChart
    ),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your IT assets and assignments.
        </p>
      </div>

      <KpiCards />

      <div className="grid gap-4 lg:grid-cols-2">
        <DevicesByTypeChart />
        <DevicesByStatusChart />
      </div>

      <RecentActivity />
    </div>
  );
}
