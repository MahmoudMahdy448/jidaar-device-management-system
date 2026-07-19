"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AssignmentTable } from "@/components/assignments/assignment-table";
import { AssignDialog } from "@/components/assignments/assign-dialog";
import { ReturnDialog } from "@/components/assignments/return-dialog";
import { TransferDialog } from "@/components/assignments/transfer-dialog";
import { useAssignments } from "@/hooks/use-assignments";
import { useReferenceData } from "@/hooks/use-reference-data";
import { toast } from "sonner";

type TabValue = "all" | "active" | "returned" | "overdue";

export default function AssignmentsPage() {
  const [tab, setTab] = useState<TabValue>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [deviceTypeId, setDeviceTypeId] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [returnAssignment, setReturnAssignment] = useState<{
    id: string;
    deviceName: string;
  } | null>(null);
  const [transferAssignment, setTransferAssignment] = useState<{
    id: string;
    deviceName: string;
  } | null>(null);

  const { data: departments } = useReferenceData<{ id: string; name: string }>("departments");
  const { data: deviceTypes } = useReferenceData<{ id: string; name: string }>("device-types");

  const filters = useMemo(
    () => ({
      page,
      pageSize: 20,
      ...(tab === "active" && { status: "open" as const }),
      ...(tab === "returned" && { status: "closed" as const }),
      ...(tab === "overdue" && { overdue: true }),
      search: search || undefined,
      departmentId: departmentId !== "all" ? departmentId : undefined,
      deviceTypeId: deviceTypeId !== "all" ? deviceTypeId : undefined,
    }),
    [page, tab, search, departmentId, deviceTypeId]
  );

  const { assignments, meta, isLoading, error, mutate } = useAssignments(filters);

  const totalPages = meta ? Math.ceil(meta.total / meta.pageSize) : 1;

  const handleTabChange = useCallback((value: string) => {
    setTab(value as TabValue);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleDepartmentChange = useCallback((value: string) => {
    setDepartmentId(value);
    setPage(1);
  }, []);

  const handleDeviceTypeChange = useCallback((value: string) => {
    setDeviceTypeId(value);
    setPage(1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Assignments</h2>
          <p className="text-sm text-muted-foreground">
            Manage device assignments and transfers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              if (tab === "active") params.set("status", "open");
              if (tab === "returned") params.set("status", "closed");
              const qs = params.toString();
              window.open(`/api/export/assignments${qs ? `?${qs}` : ""}`, "_blank");
            }}
          >
            <Download className="size-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <Plus className="size-4" />
            Assign Device
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by device name, asset ID, user name, email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Select value={departmentId} onValueChange={(v) => handleDepartmentChange(v ?? "")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d: { id: string; name: string }) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={deviceTypeId} onValueChange={(v) => handleDeviceTypeChange(v ?? "")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All device types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All device types</SelectItem>
              {deviceTypes.map((dt: { id: string; name: string }) => (
                <SelectItem key={dt.id} value={dt.id}>
                  {dt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {isLoading ? (
            <div className="flex flex-col gap-2 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border p-8 text-center">
              <p className="text-sm text-destructive">
                Failed to load assignments. Please try again.
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
          ) : (
            <>
              <AssignmentTable
                assignments={assignments}
                onReturn={(id, deviceName) =>
                  setReturnAssignment({ id, deviceName })
                }
                onTransfer={(id, deviceName) =>
                  setTransferAssignment({ id, deviceName })
                }
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({meta?.total ?? 0} assignments)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <AssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onSuccess={() => {
          mutate();
          toast.success("Device assigned successfully");
        }}
      />

      {returnAssignment && (
        <ReturnDialog
          open={!!returnAssignment}
          onOpenChange={(open) => {
            if (!open) setReturnAssignment(null);
          }}
          assignmentId={returnAssignment.id}
          deviceName={returnAssignment.deviceName}
          onSuccess={() => {
            setReturnAssignment(null);
            mutate();
            toast.success("Device returned successfully");
          }}
        />
      )}

      {transferAssignment && (
        <TransferDialog
          open={!!transferAssignment}
          onOpenChange={(open) => {
            if (!open) setTransferAssignment(null);
          }}
          assignmentId={transferAssignment.id}
          deviceName={transferAssignment.deviceName}
          onSuccess={() => {
            setTransferAssignment(null);
            mutate();
            toast.success("Device transferred successfully");
          }}
        />
      )}
    </div>
  );
}
