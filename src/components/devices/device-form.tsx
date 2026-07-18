"use client";

import { useEffect } from "react";
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

interface DeviceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

function getErrorMessage(
  errors: Record<string, unknown>,
  field: string
): string | undefined {
  const error = errors[field] as { message?: string } | undefined;
  return error?.message;
}

export function DeviceForm({ open, onOpenChange, device, onSave }: DeviceFormProps) {
  const isEditing = !!device;

  const { data: deviceTypes } = useReferenceData<{ id: string; name: string }>("device-types");
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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(DeviceSchema),
  });

  useEffect(() => {
    if (open) {
      if (device) {
        reset({
          name: (device.name as string) ?? "",
          assetId: (device.assetId as string) ?? "",
          deviceTypeId: (device.deviceTypeId as string) ?? "",
          manufacturerId: (device.manufacturerId as string) ?? "",
          model: (device.model as string) ?? "",
          serialNumber: (device.serialNumber as string) ?? "",
          inventoryNumber: (device.inventoryNumber as string) ?? "",
          hostname: (device.hostname as string) ?? "",
          ipAddress: (device.ipAddress as string) ?? "",
          macAddress: (device.macAddress as string) ?? "",
          statusId: (device.statusId as string) ?? "",
          departmentId: (device.departmentId as string) ?? "",
          locationId: (device.locationId as string) ?? "",
          vendorId: (device.vendorId as string) ?? "",
          purchaseDate: (device.purchaseDate as string) ?? "",
          warrantyExpiration: (device.warrantyExpiration as string) ?? "",
          purchasePrice: (device.purchasePrice as number) ?? "",
          notes: (device.notes as string) ?? "",
        });
      } else {
        reset({
          name: "",
          assetId: "",
          deviceTypeId: "",
          manufacturerId: "",
          model: "",
          serialNumber: "",
          inventoryNumber: "",
          hostname: "",
          ipAddress: "",
          macAddress: "",
          statusId: "",
          departmentId: "",
          locationId: "",
          vendorId: "",
          purchaseDate: "",
          warrantyExpiration: "",
          purchasePrice: "",
          notes: "",
        });
      }
    }
  }, [open, device, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    await onSave(data);
    onOpenChange(false);
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
            {getErrorMessage(errors, "name") && (
              <p className="text-xs text-destructive">
                {getErrorMessage(errors, "name")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="assetId">Asset ID *</Label>
            <Input
              id="assetId"
              {...register("assetId")}
              placeholder="e.g. AST-001"
            />
            {getErrorMessage(errors, "assetId") && (
              <p className="text-xs text-destructive">
                {getErrorMessage(errors, "assetId")}
              </p>
            )}
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
              {getErrorMessage(errors, "deviceTypeId") && (
                <p className="text-xs text-destructive">
                  {getErrorMessage(errors, "deviceTypeId")}
                </p>
              )}
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
              {getErrorMessage(errors, "statusId") && (
                <p className="text-xs text-destructive">
                  {getErrorMessage(errors, "statusId")}
                </p>
              )}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" {...register("serialNumber")} placeholder="Serial number" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="inventoryNumber">Inventory Number</Label>
              <Input id="inventoryNumber" {...register("inventoryNumber")} placeholder="Inventory #" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="hostname">Hostname</Label>
            <Input id="hostname" {...register("hostname")} placeholder="e.g. pc-it-01" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input id="ipAddress" {...register("ipAddress")} placeholder="192.168.1.100" />
              {getErrorMessage(errors, "ipAddress") && (
                <p className="text-xs text-destructive">
                  {getErrorMessage(errors, "ipAddress")}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input id="macAddress" {...register("macAddress")} placeholder="AA:BB:CC:DD:EE:FF" />
              {getErrorMessage(errors, "macAddress") && (
                <p className="text-xs text-destructive">
                  {getErrorMessage(errors, "macAddress")}
                </p>
              )}
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
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="warrantyExpiration">Warranty Expiration</Label>
              <Input
                id="warrantyExpiration"
                type="date"
                {...register("warrantyExpiration")}
              />
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
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Additional notes" />
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
