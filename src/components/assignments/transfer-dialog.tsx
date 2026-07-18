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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  deviceName: string;
  onSuccess: () => void;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function TransferDialog({
  open,
  onOpenChange,
  assignmentId,
  deviceName,
  onSuccess,
}: TransferDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [transferDate, setTransferDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const resetForm = useCallback(() => {
    setSelectedUserId("");
    setTransferDate(todayISO());
    setNotes("");
    setUserSearch("");
  }, []);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/users?pageSize=500")
      .then((r) => r.json())
      .then((res) => {
        setUsers(res.data ?? []);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        resetForm();
        fetchUsers();
      }
      onOpenChange(newOpen);
    },
    [onOpenChange, resetForm, fetchUsers],
  );

  const filteredUsers = users.filter((u) => {
    const query = userSearch.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(query) ||
      u.lastName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = useCallback(async () => {
    if (!selectedUserId) {
      setError("Please select a new user");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/assignments/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          newUserId: selectedUserId,
          transferDate,
          notes: notes || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to transfer device");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }, [assignmentId, selectedUserId, transferDate, notes, onSuccess, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Device</DialogTitle>
          <DialogDescription>
            Transfer &quot;{deviceName}&quot; to another user.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>New User *</Label>
              {selectedUser ? (
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUserId("")}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <div className="max-h-40 overflow-y-auto rounded-lg border">
                    {filteredUsers.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No users found.
                      </p>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="transferDate">Transfer Date *</Label>
              <Input
                id="transferDate"
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="transferNotes">Notes</Label>
              <Textarea
                id="transferNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || loading || !selectedUserId}
          >
            {submitting ? "Transferring..." : "Transfer Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
