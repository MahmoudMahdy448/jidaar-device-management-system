"use client";

import { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferenceTable } from "@/components/reference-data/reference-table";
import { ReferenceForm } from "@/components/reference-data/reference-form";
import { DeleteConfirmDialog } from "@/components/reference-data/delete-confirm-dialog";
import {
  useReferenceData,
  type ReferenceResource,
} from "@/hooks/use-reference-data";
import { toast } from "sonner";

interface ReferencePageProps {
  resource: ReferenceResource;
}

interface ReferenceItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

export default function ReferencePage({ resource }: ReferencePageProps) {
  const { data, isLoading, error, mutate } = useReferenceData<ReferenceItem>(resource);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferenceItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ReferenceItem | null>(null);
  const [referenceCount, setReferenceCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = useCallback((item: ReferenceItem) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((item: ReferenceItem) => {
    setDeleteItem(item);
    const count =
      (item as Record<string, unknown>)._count as Record<string, number> | undefined;
    setReferenceCount(
      count ? Object.values(count).reduce((a, b) => a + b, 0) : 0
    );
  }, []);

  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      const url = editingItem
        ? `/api/${resource}/${editingItem.id}`
        : `/api/${resource}`;

      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to save");
      }

      toast.success(editingItem ? "Updated successfully" : "Created successfully");
      mutate();
    },
    [editingItem, resource, mutate]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/${resource}/${deleteItem.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to delete");
      }

      toast.success("Deleted successfully");
      setDeleteItem(null);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItem, resource, mutate]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground capitalize">
              {resource.replace("-", " ")}
            </h2>
          </div>
        </div>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-sm text-destructive">Failed to load data. Please try again.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {resource.replace("-", " ")}
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage {resource.replace("-", " ")} in the system.
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <ReferenceTable
        resource={resource}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReferenceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        resource={resource}
        item={editingItem}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
        itemName={deleteItem?.name ?? ""}
        referenceCount={referenceCount}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
