"use client";

import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error?.message || "Failed to fetch");
  return json;
}

export function DevicesByTypeChart() {
  const { data, isLoading } = useSWR("/api/dashboard/charts", fetcher, {
    revalidateOnFocus: false,
  });

  const devicesByType = data?.data?.devicesByType ?? [];

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Devices by Type</h3>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : devicesByType.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={devicesByType}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="type"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              allowDecimals={false}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
