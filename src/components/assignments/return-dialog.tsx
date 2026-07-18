"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  deviceName: string;
  onSuccess: () => void;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function ReturnDialog({
  open,
  onOpenChange,
  assignmentId,
  deviceName,
  onSuccess,
}: ReturnDialogProps) {
  const [returnDate, setReturnDate] = useState(todayISO());
  const [closedReason, setClosedReason] = useState("RETURNED");
  const [conditionAfter, setConditionAfter] = useState("Good");

  const handleClosedReasonChange = (value: string | null) => {
    if (value) setClosedReason(value);
  };
  const handleConditionChange = (value: string | null) => {
    if (value) setConditionAfter(value);
  };
  const [needsMaintenance, setNeedsMaintenance] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnDate,
          closedReason,
          conditionAfter,
          needsMaintenance,
          notes: notes || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to return device");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }, [assignmentId, returnDate, closedReason, conditionAfter, needsMaintenance, notes, onSuccess, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Return Device</DialogTitle>
          <DialogDescription>
            Return &quot;{deviceName}&quot; and close this assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="returnDate">Return Date *</Label>
              <Input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Reason *</Label>
              <Select value={closedReason} onValueChange={handleClosedReasonChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                  <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Condition After Use</Label>
            <Select value={conditionAfter} onValueChange={handleConditionChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
                <SelectItem value="Damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="needsMaintenance"
              checked={needsMaintenance}
              onChange={(e) => setNeedsMaintenance(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <Label htmlFor="needsMaintenance" className="cursor-pointer">
              Device needs maintenance
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="returnNotes">Notes</Label>
            <Textarea
              id="returnNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Returning..." : "Return Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
