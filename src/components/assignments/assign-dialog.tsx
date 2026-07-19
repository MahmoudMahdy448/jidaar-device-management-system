"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import { useDebounce } from "@/hooks/use-debounce";

interface Device {
  id: string;
  name: string;
  assetId: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function AssignDialog({ open, onOpenChange, onSuccess }: AssignDialogProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [assignmentDate, setAssignmentDate] = useState(todayISO());
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const debouncedDeviceSearch = useDebounce(deviceSearch, 300);
  const debouncedUserSearch = useDebounce(userSearch, 300);

  const [availableStatusId, setAvailableStatusId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetForm = useCallback(() => {
    setSelectedDeviceId("");
    setSelectedUserId("");
    setAssignmentDate(todayISO());
    setExpectedReturnDate("");
    setNotes("");
    setDeviceSearch("");
    setUserSearch("");
    setDevices([]);
    setUsers([]);
    setAvailableStatusId(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch("/api/device-statuses", { signal: controller.signal });
        const json = await res.json();
        const statuses = (json.data ?? []) as { id: string; name: string }[];
        const available = statuses.find((s) => s.name === "Available");
        setAvailableStatusId(available?.id ?? null);
      } catch {
        if (!controller.signal.aborted) {
          setAvailableStatusId(null);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    if (!open || !availableStatusId) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const params = new URLSearchParams({
      pageSize: "25",
      statusId: availableStatusId,
    });
    if (debouncedDeviceSearch) params.set("search", debouncedDeviceSearch);

    fetch(`/api/devices?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((res) => setDevices(res.data ?? []))
      .catch(() => {
        if (!controller.signal.aborted) setDevices([]);
      });

    return () => controller.abort();
  }, [open, debouncedDeviceSearch, availableStatusId]);

  useEffect(() => {
    if (!open) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const params = new URLSearchParams({ pageSize: "25" });
    if (debouncedUserSearch) params.set("search", debouncedUserSearch);

    fetch(`/api/users?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((res) => setUsers(res.data ?? []))
      .catch(() => {
        if (!controller.signal.aborted) setUsers([]);
      });

    return () => controller.abort();
  }, [open, debouncedUserSearch]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        resetForm();
        setLoading(true);
        setError(null);
      } else {
        abortControllerRef.current?.abort();
      }
      onOpenChange(newOpen);
    },
    [onOpenChange, resetForm],
  );

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = useCallback(async () => {
    if (!selectedDeviceId || !selectedUserId) {
      setError("Please select a device and a user");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: selectedDeviceId,
          userId: selectedUserId,
          assignmentDate,
          expectedReturnDate: expectedReturnDate || null,
          notes: notes || null,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to assign device");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedDeviceId,
    selectedUserId,
    assignmentDate,
    expectedReturnDate,
    notes,
    onSuccess,
    onOpenChange,
  ]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Device</DialogTitle>
          <DialogDescription>
            Assign a device to a user. Only available devices are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Device *</Label>
            {selectedDevice ? (
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm">
                  {selectedDevice.name} ({selectedDevice.assetId})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDeviceId("")}
                >
                  Change
                </Button>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Search devices..."
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto rounded-lg border">
                  {loading ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Loading...
                    </p>
                  ) : devices.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No available devices found.
                    </p>
                  ) : (
                    devices.map((device) => (
                      <button
                        key={device.id}
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => setSelectedDeviceId(device.id)}
                      >
                        <span>{device.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {device.assetId}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>User *</Label>
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
                  {users.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No users found.
                    </p>
                  ) : (
                    users.map((user) => (
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="assignmentDate">Assignment Date *</Label>
              <Input
                id="assignmentDate"
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expectedReturnDate">Expected Return</Label>
              <Input
                id="expectedReturnDate"
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
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
          <Button
            onClick={handleSubmit}
            disabled={submitting || loading || !selectedDeviceId || !selectedUserId}
          >
            {submitting ? "Assigning..." : "Assign Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
