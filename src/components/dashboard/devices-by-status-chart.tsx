"use client";

import useSWR from "swr";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChartIcon } from "lucide-react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error?.message || "Failed to fetch");
  return json;
}

export function DevicesByStatusChart() {
  const { data, isLoading } = useSWR("/api/dashboard/charts", fetcher, {
    revalidateOnFocus: false,
  });

  const devicesByStatus = data?.data?.devicesByStatus ?? [];

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-4 flex items-center gap-2">
        <PieChartIcon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Devices by Status</h3>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : devicesByStatus.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={devicesByStatus}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
            >
              {devicesByStatus.map((entry: { color: string }, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
