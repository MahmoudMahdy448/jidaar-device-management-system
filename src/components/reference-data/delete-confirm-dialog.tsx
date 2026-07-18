"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  referenceCount: number;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  referenceCount,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  const isBlocked = referenceCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBlocked ? "Cannot delete" : "Delete confirmation"}
          </DialogTitle>
          <DialogDescription>
            {isBlocked ? (
              <span className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="size-4" />
                  This item cannot be deleted.
                </span>
                <span>
                  <strong>{itemName}</strong> is referenced by {referenceCount}{" "}
                  {referenceCount === 1 ? "record" : "records"} and cannot be
                  removed.
                </span>
              </span>
            ) : (
              <span>
                Are you sure you want to delete <strong>{itemName}</strong>? This
                action cannot be undone.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {isBlocked ? "Close" : "Cancel"}
          </Button>
          {!isBlocked && (
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
