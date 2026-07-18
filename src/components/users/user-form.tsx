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
import { z } from "zod";
import { useReferenceData } from "@/hooks/use-reference-data";

const CreateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().max(20).optional().nullable(),
  employeeId: z.string().min(1, "Employee ID is required").max(50),
  departmentId: z.string().uuid().optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  officeLocation: z.string().max(100).optional().nullable(),
  role: z.enum(["ADMIN", "TECHNICIAN", "READ_ONLY"]).default("READ_ONLY"),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).default("ACTIVE"),
  notes: z.string().optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

const EditUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().max(20).optional().nullable(),
  employeeId: z.string().min(1, "Employee ID is required").max(50),
  departmentId: z.string().uuid().optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  officeLocation: z.string().max(100).optional().nullable(),
  role: z.enum(["ADMIN", "TECHNICIAN", "READ_ONLY"]),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]),
  notes: z.string().optional().nullable(),
});

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

function getErrorMessage(
  errors: Record<string, unknown>,
  field: string
): string | undefined {
  const error = errors[field] as { message?: string } | undefined;
  return error?.message;
}

export function UserForm({ open, onOpenChange, user, onSave }: UserFormProps) {
  const isEditing = !!user;

  const { data: departments } = useReferenceData<{ id: string; name: string }>("departments");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEditing ? EditUserSchema : CreateUserSchema),
  });

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          firstName: (user.firstName as string) ?? "",
          lastName: (user.lastName as string) ?? "",
          email: (user.email as string) ?? "",
          phone: (user.phone as string) ?? "",
          employeeId: (user.employeeId as string) ?? "",
          departmentId: (user.departmentId as string) ?? "",
          jobTitle: (user.jobTitle as string) ?? "",
          officeLocation: (user.officeLocation as string) ?? "",
          role: (user.role as "ADMIN" | "TECHNICIAN" | "READ_ONLY") ?? "READ_ONLY",
          status: (user.status as "ACTIVE" | "INACTIVE" | "TERMINATED") ?? "ACTIVE",
          notes: (user.notes as string) ?? "",
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          employeeId: "",
          departmentId: "",
          jobTitle: "",
          officeLocation: "",
          role: "READ_ONLY" as const,
          status: "ACTIVE" as const,
          notes: "",
          password: "",
        });
      }
    }
  }, [open, user, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    await onSave(data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit User" : "Add User"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the user details."
              : "Add a new user to the system."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 px-4 pb-4"
        >
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Personal Information
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...register("firstName")} placeholder="First name" />
              {getErrorMessage(errors, "firstName") && (
                <p className="text-xs text-destructive">
                  {getErrorMessage(errors, "firstName")}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...register("lastName")} placeholder="Last name" />
              {getErrorMessage(errors, "lastName") && (
                <p className="text-xs text-destructive">
                  {getErrorMessage(errors, "lastName")}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="user@example.com" />
            {getErrorMessage(errors, "email") && (
              <p className="text-xs text-destructive">
                {getErrorMessage(errors, "email")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} placeholder="+966 5X XXX XXXX" />
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Employment
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input id="employeeId" {...register("employeeId")} placeholder="e.g. EMP-001" />
              {getErrorMessage(errors, "employeeId") && (
                <p className="text-xs text-destructive">
                  {getErrorMessage(errors, "employeeId")}
                </p>
              )}
            </div>

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
                      {departments.map((d: { id: string; name: string }) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" {...register("jobTitle")} placeholder="e.g. IT Specialist" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="officeLocation">Office Location</Label>
              <Input id="officeLocation" {...register("officeLocation")} placeholder="e.g. Building A" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Account
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? "READ_ONLY"}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="TECHNICIAN">Technician</SelectItem>
                      <SelectItem value="READ_ONLY">Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? "ACTIVE"}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="TERMINATED">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {!isEditing && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Min. 8 characters"
              />
              {getErrorMessage(errors, "password") && (
                <p className="text-xs text-destructive">
                  {getErrorMessage(errors, "password")}
                </p>
              )}
            </div>
          )}

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
