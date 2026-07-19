"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeviceSchema } from "@/lib/validations";
import { useReferenceData } from "@/hooks/use-reference-data";
import { SPEC_FIELDS_BY_CATEGORY } from "@/lib/spec-fields";
import { toast } from "sonner";

interface DeviceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function DeviceForm({ open, onOpenChange, device, onSave }: DeviceFormProps) {
  const isEditing = !!device;

  const { data: deviceTypes } = useReferenceData<{ id: string; name: string; category?: string }>("device-types");
  const { data: deviceStatuses } = useReferenceData<{ id: string; name: string }>("device-statuses");
  const { data: departments } = useReferenceData<{ id: string; name: string }>("departments");
  const { data: manufacturers } = useReferenceData<{ id: string; name: string }>("manufacturers");
  const { data: locations } = useReferenceData<{ id: string; name: string }>("locations");
  const { data: vendors } = useReferenceData<{ id: string; name: string }>("vendors");

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(DeviceSchema),
    mode: "onBlur",
  });

  const [suggestedAssetId, setSuggestedAssetId] = useState("");
  const assetIdAppliedRef = useRef(false);

  const selectedDeviceType = deviceTypes.find(
    (t: { id: string }) => t.id === (device ? device.deviceTypeId : watch("deviceTypeId") ?? ""),
  );
  const category = selectedDeviceType?.category as string | undefined;
  const specFields = category ? SPEC_FIELDS_BY_CATEGORY[category] ?? [] : [];

  useEffect(() => {
    if (open && !device) {
      assetIdAppliedRef.current = false;
      fetch("/api/devices/next-asset-id")
        .then((r) => r.json())
        .then((res) => {
          if (res.data?.assetId) {
            setSuggestedAssetId(res.data.assetId);
            if (!assetIdAppliedRef.current) {
              setValue("assetId", res.data.assetId);
              assetIdAppliedRef.current = true;
            }
          }
        })
        .catch(() => {});
    }
  }, [open, device, setValue]);

  useEffect(() => {
    if (open) {
      if (device) {
        reset({
          name: (device.name as string) ?? "",
          assetId: (device.assetId as string) ?? "",
          deviceTypeId: (device.deviceTypeId as string) ?? "",
          manufacturerId: (device.manufacturerId as string) || null,
          model: (device.model as string) || null,
          serialNumber: (device.serialNumber as string) || null,
          inventoryNumber: (device.inventoryNumber as string) || null,
          hostname: (device.hostname as string) || null,
          ipAddress: (device.ipAddress as string) || null,
          macAddress: (device.macAddress as string) || null,
          statusId: (device.statusId as string) ?? "",
          departmentId: (device.departmentId as string) || null,
          locationId: (device.locationId as string) || null,
          vendorId: (device.vendorId as string) || null,
          purchaseDate: (device.purchaseDate as string) || null,
          warrantyExpiration: (device.warrantyExpiration as string) || null,
          purchasePrice: (device.purchasePrice as number) ?? null,
          notes: (device.notes as string) || null,
          specifications: (device.specifications as Record<string, string>) ?? {},
        });
      } else {
        reset({
          name: "",
          assetId: "",
          deviceTypeId: "",
          manufacturerId: null,
          model: null,
          serialNumber: null,
          inventoryNumber: null,
          hostname: null,
          ipAddress: null,
          macAddress: null,
          statusId: "",
          departmentId: null,
          locationId: null,
          vendorId: null,
          purchaseDate: null,
          warrantyExpiration: null,
          purchasePrice: null,
          notes: null,
          specifications: {},
        });
      }
    }
  }, [open, device, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    const cleaned = { ...data };
    const nullableFields = [
      "manufacturerId", "departmentId", "locationId", "vendorId",
      "model", "serialNumber", "inventoryNumber", "hostname",
      "ipAddress", "macAddress", "purchaseDate", "warrantyExpiration",
      "notes",
    ];
    for (const f of nullableFields) {
      if (cleaned[f] === "" || cleaned[f] === undefined) cleaned[f] = null;
    }
    if (cleaned.purchasePrice === "" || cleaned.purchasePrice === undefined) cleaned.purchasePrice = null;
    try {
      await onSave(cleaned);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save device");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Device" : "Add Device"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the device details."
              : "Add a new device to the system."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 px-4 pb-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} placeholder="Device name" />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="assetId">Asset ID *</Label>
            <Input
              id="assetId"
              {...register("assetId")}
              placeholder="e.g. AST-001"
            />
            <FieldError message={errors.assetId?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Device Type *</Label>
              <Controller
                name="deviceTypeId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((t: { id: string; name: string }) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.deviceTypeId?.message} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Status *</Label>
              <Controller
                name="statusId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceStatuses.map(
                        (s: { id: string; name: string }) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.statusId?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Department</Label>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(
                        (d: { id: string; name: string }) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Location</Label>
              <Controller
                name="locationId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(
                        (l: { id: string; name: string }) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Manufacturer</Label>
              <Controller
                name="manufacturerId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map(
                        (m: { id: string; name: string }) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Vendor</Label>
              <Controller
                name="vendorId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map(
                        (v: { id: string; name: string }) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" {...register("model")} placeholder="e.g. Dell OptiPlex 7090" />
            <FieldError message={errors.model?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" {...register("serialNumber")} placeholder="Serial number" />
              <FieldError message={errors.serialNumber?.message} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="inventoryNumber">Inventory Number</Label>
              <Input id="inventoryNumber" {...register("inventoryNumber")} placeholder="Inventory #" />
              <FieldError message={errors.inventoryNumber?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="hostname">Hostname</Label>
            <Input id="hostname" {...register("hostname")} placeholder="e.g. pc-it-01" />
            <FieldError message={errors.hostname?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input id="ipAddress" {...register("ipAddress")} placeholder="192.168.1.100" />
              <FieldError message={errors.ipAddress?.message} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input id="macAddress" {...register("macAddress")} placeholder="AA:BB:CC:DD:EE:FF" />
              <FieldError message={errors.macAddress?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register("purchaseDate")}
              />
              <FieldError message={errors.purchaseDate?.message} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="warrantyExpiration">Warranty Expiration</Label>
              <Input
                id="warrantyExpiration"
                type="date"
                {...register("warrantyExpiration")}
              />
              <FieldError message={errors.warrantyExpiration?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              {...register("purchasePrice")}
              placeholder="0.00"
            />
            <FieldError message={errors.purchasePrice?.message} />
          </div>

          {specFields.length > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Specifications — {category}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {specFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-2">
                    <Label htmlFor={`spec-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`spec-${field.key}`}
                      value={(watch("specifications") as Record<string, string>)?.[field.key] ?? ""}
                      onChange={(e) => {
                        const current = (watch("specifications") as Record<string, string>) ?? {};
                        setValue("specifications", { ...current, [field.key]: e.target.value }, { shouldDirty: true });
                      }}
                      placeholder={field.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Additional notes" />
            <FieldError message={errors.notes?.message} />
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
