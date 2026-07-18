"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignmentTable } from "@/components/assignments/assignment-table";
import { AssignDialog } from "@/components/assignments/assign-dialog";
import { ReturnDialog } from "@/components/assignments/return-dialog";
import { TransferDialog } from "@/components/assignments/transfer-dialog";
import { useAssignments } from "@/hooks/use-assignments";
import { toast } from "sonner";

type TabValue = "all" | "active" | "returned" | "overdue";

export default function AssignmentsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>("all");
  const [page, setPage] = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);
  const [returnAssignment, setReturnAssignment] = useState<{
    id: string;
    deviceName: string;
  } | null>(null);
  const [transferAssignment, setTransferAssignment] = useState<{
    id: string;
    deviceName: string;
  } | null>(null);

  const filters = useMemo(
    () => ({
      page,
      pageSize: 20,
      ...(tab === "active" && { status: "open" as const }),
      ...(tab === "returned" && { status: "closed" as const }),
      ...(tab === "overdue" && { overdue: true }),
    }),
    [page, tab]
  );

  const { assignments, meta, isLoading, error, mutate } = useAssignments(filters);

  const totalPages = meta ? Math.ceil(meta.total / meta.pageSize) : 1;

  const handleTabChange = useCallback((value: string) => {
    setTab(value as TabValue);
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
        <Button size="sm" onClick={() => setAssignOpen(true)}>
          <Plus className="size-4" />
          Assign Device
        </Button>
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
