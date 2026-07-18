"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeviceForm } from "@/components/devices/device-form";
import { useDevice } from "@/hooks/use-devices";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function DeviceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { device, isLoading, error } = useDevice(id);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (device && !isLoading) {
      setFormOpen(true);
    }
  }, [device, isLoading]);

  const handleSave = async (formData: Record<string, unknown>) => {
    const res = await fetch(`/api/devices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const json = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error?.message || "Failed to save");
    }

    toast.success("Device updated successfully");
    router.push(`/devices/${id}`);
  };

  const handleOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      router.push(`/devices/${id}`);
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
          <h2 className="text-lg font-semibold text-foreground">Edit Device</h2>
        </div>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-sm text-destructive">
            Failed to load device. It may have been deleted.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.push("/devices")}
          >
            Back to Devices
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
        <h2 className="text-lg font-semibold text-foreground">Edit Device</h2>
      </div>

      <DeviceForm
        open={formOpen}
        onOpenChange={handleOpenChange}
        device={device}
        onSave={handleSave}
      />
    </div>
  );
}
