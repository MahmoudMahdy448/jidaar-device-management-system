"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeviceDetail } from "@/components/devices/device-detail";
import { useDevice } from "@/hooks/use-devices";
import { toast } from "sonner";

export default function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { device, isLoading, error, mutate } = useDevice(id);

  const handleDelete = async () => {
    if (!device) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this device?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to delete");
      }

      toast.success("Device deleted successfully");
      router.push("/devices");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete device"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Device</h2>
        </div>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-sm text-destructive">
            Failed to load device. It may have been deleted.
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Device Details</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/devices/${id}/edit`)}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <DeviceDetail device={device} />
    </div>
  );
}
