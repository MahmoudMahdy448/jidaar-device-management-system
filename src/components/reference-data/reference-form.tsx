"use client";

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
import { useForm, type FieldErrors, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DepartmentSchema,
  LocationSchema,
  ManufacturerSchema,
  VendorSchema,
  DeviceTypeSchema,
  DeviceStatusSchema,
} from "@/lib/validations";
import { useEffect } from "react";
import type { ReferenceResource } from "@/hooks/use-reference-data";

type ReferenceItem = Record<string, unknown> & { id: string; name: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCHEMAS: Record<ReferenceResource, any> = {
  departments: DepartmentSchema,
  locations: LocationSchema,
  manufacturers: ManufacturerSchema,
  vendors: VendorSchema,
  "device-types": DeviceTypeSchema,
  "device-statuses": DeviceStatusSchema,
};

const TITLES: Record<ReferenceResource, string> = {
  departments: "Department",
  locations: "Location",
  manufacturers: "Manufacturer",
  vendors: "Vendor",
  "device-types": "Device type",
  "device-statuses": "Device status",
};

function getErrorMessage(errors: FieldErrors, field: string): string | undefined {
  const error = errors[field];
  if (!error) return undefined;
  if ("message" in error && typeof error.message === "string") return error.message;
  return undefined;
}

function getDefaultValues(resource: ReferenceResource, item?: ReferenceItem | null) {
  const base = { name: "" };
  if (item) {
    base.name = (item.name as string) ?? "";
  }

  switch (resource) {
    case "departments":
      return { ...base, code: item ? ((item.code as string) ?? "") : "" };
    case "locations":
      return {
        ...base,
        building: item ? ((item.building as string) ?? "") : "",
        floor: item ? ((item.floor as string) ?? "") : "",
        room: item ? ((item.room as string) ?? "") : "",
      };
    case "manufacturers":
      return { ...base, website: item ? ((item.website as string) ?? "") : "" };
    case "vendors":
      return {
        ...base,
        contactName: item ? ((item.contactName as string) ?? "") : "",
        email: item ? ((item.email as string) ?? "") : "",
        phone: item ? ((item.phone as string) ?? "") : "",
        website: item ? ((item.website as string) ?? "") : "",
      };
    case "device-types":
      return {
        ...base,
        description: item ? ((item.description as string) ?? "") : "",
        category: item ? ((item.category as string) ?? "") : "",
      };
    case "device-statuses":
      return {
        ...base,
        color: item ? ((item.color as string) ?? "#3b82f6") : "#3b82f6",
        sortOrder: item ? ((item.sortOrder as number) ?? 0) : 0,
      };
    default:
      return base;
  }
}

interface ReferenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: ReferenceResource;
  item?: ReferenceItem | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export function ReferenceForm({
  open,
  onOpenChange,
  resource,
  item,
  onSave,
}: ReferenceFormProps) {
  const isEditing = !!item;
  const title = TITLES[resource];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(SCHEMAS[resource] as any),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(resource, item));
    }
  }, [open, item, resource, reset]);

  const onSubmit = async (data: FieldValues) => {
    await onSave(data);
    onOpenChange(false);
  };

  const nameError = getErrorMessage(errors, "name");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? `Edit ${title}` : `Add ${title}`}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? `Update the ${title.toLowerCase()} details.`
              : `Add a new ${title.toLowerCase()} to the system.`}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder={`Enter ${title.toLowerCase()} name`} />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>

          {resource === "departments" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" {...register("code")} placeholder="e.g. IT, HR" />
              {getErrorMessage(errors, "code") && (
                <p className="text-xs text-destructive">{getErrorMessage(errors, "code")}</p>
              )}
            </div>
          )}

          {resource === "locations" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="building">Building</Label>
                <Input id="building" {...register("building")} placeholder="Building name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" {...register("floor")} placeholder="Floor number" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="room">Room</Label>
                <Input id="room" {...register("room")} placeholder="Room number" />
              </div>
            </>
          )}

          {resource === "manufacturers" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register("website")} placeholder="https://example.com" />
              {getErrorMessage(errors, "website") && (
                <p className="text-xs text-destructive">{getErrorMessage(errors, "website")}</p>
              )}
            </div>
          )}

          {resource === "vendors" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactName">Contact name</Label>
                <Input id="contactName" {...register("contactName")} placeholder="Contact person" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="contact@vendor.com" />
                {getErrorMessage(errors, "email") && (
                  <p className="text-xs text-destructive">{getErrorMessage(errors, "email")}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} placeholder="+1 234 567 890" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register("website")} placeholder="https://example.com" />
                {getErrorMessage(errors, "website") && (
                  <p className="text-xs text-destructive">{getErrorMessage(errors, "website")}</p>
                )}
              </div>
            </>
          )}

          {resource === "device-types" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} placeholder="Description" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category")} placeholder="e.g. Networking, Server" />
              </div>
            </>
          )}

          {resource === "device-statuses" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color-picker"
                    className="size-8 cursor-pointer rounded border border-input bg-transparent"
                    {...register("color")}
                  />
                  <Input id="color" {...register("color")} placeholder="#FF0000" className="flex-1" />
                </div>
                {getErrorMessage(errors, "color") && (
                  <p className="text-xs text-destructive">{getErrorMessage(errors, "color")}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sortOrder">Sort order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register("sortOrder")}
                  placeholder="0"
                />
              </div>
            </>
          )}

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
