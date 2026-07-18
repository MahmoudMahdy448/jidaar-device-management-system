"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm } from "@/components/users/user-form";
import { useUser } from "@/hooks/use-users";
import { toast } from "sonner";
import { useCallback } from "react";

export default function UserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading, error, mutate } = useUser(id);

  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to save");
      }

      toast.success("User updated successfully");
      mutate();
      router.push(`/users/${id}`);
    },
    [id, mutate, router]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Edit User</h2>
        </div>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-sm text-destructive">
            Failed to load user. It may have been deleted.
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
        <h2 className="text-lg font-semibold text-foreground">Edit User</h2>
      </div>

      <UserForm
        open={true}
        onOpenChange={(open) => {
          if (!open) router.push(`/users/${id}`);
        }}
        user={user}
        onSave={handleSave}
      />
    </div>
  );
}
