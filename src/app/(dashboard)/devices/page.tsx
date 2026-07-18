"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeviceTable } from "@/components/devices/device-table";
import { DeviceForm } from "@/components/devices/device-form";
import { DeviceFilters } from "@/components/devices/device-filters";
import { useDevices } from "@/hooks/use-devices";
import { toast } from "sonner";

export default function DevicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusId, setStatusId] = useState("");
  const [deviceTypeId, setDeviceTypeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const filters = useMemo(
    () => ({
      page,
      pageSize: 20,
      search: search || undefined,
      statusId: statusId !== "all" ? statusId : undefined,
      deviceTypeId: deviceTypeId !== "all" ? deviceTypeId : undefined,
      departmentId: departmentId !== "all" ? departmentId : undefined,
    }),
    [page, search, statusId, deviceTypeId, departmentId]
  );

  const { devices, meta, isLoading, error, mutate } = useDevices(filters);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusId(value);
    setPage(1);
  }, []);

  const handleDeviceTypeChange = useCallback((value: string) => {
    setDeviceTypeId(value);
    setPage(1);
  }, []);

  const handleDepartmentChange = useCallback((value: string) => {
    setDepartmentId(value);
    setPage(1);
  }, []);

  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to save");
      }

      toast.success("Device created successfully");
      mutate();
    },
    [mutate]
  );

  const totalPages = meta ? Math.ceil(meta.total / meta.pageSize) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Devices</h2>
          <p className="text-sm text-muted-foreground">
            Manage devices in the system.
          </p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Add Device
        </Button>
      </div>

      <DeviceFilters
        search={search}
        onSearchChange={handleSearchChange}
        statusId={statusId}
        onStatusChange={handleStatusChange}
        deviceTypeId={deviceTypeId}
        onDeviceTypeChange={handleDeviceTypeChange}
        departmentId={departmentId}
        onDepartmentChange={handleDepartmentChange}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-sm text-destructive">
            Failed to load devices. Please try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => mutate()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <DeviceTable devices={devices} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({meta?.total ?? 0} devices)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <DeviceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />
    </div>
  );
}
