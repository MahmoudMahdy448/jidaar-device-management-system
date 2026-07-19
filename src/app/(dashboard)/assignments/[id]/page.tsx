"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAssignment } from "@/hooks/use-assignments";
import { AttachmentSection } from "@/components/attachments/attachment-section";

function formatDate(date: string | null | undefined): string {
  if (!date) return "\u2014";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isOpen(assignment: { returnDate: string | null | undefined }): boolean {
  return !assignment.returnDate;
}

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { assignment, isLoading, error } = useAssignment(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Assignment</h2>
        </div>
        <div className="rounded-xl border p-8 text-center">
          <p className="text-sm text-destructive">
            Failed to load assignment. It may have been deleted.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.push("/assignments")}
          >
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const active = isOpen(assignment);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Assignment Details
          </h2>
          {active && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `/assignments/${id}?return=1`
                  )
                }
              >
                <RotateCcw className="size-4" />
                Return
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `/assignments/${id}?transfer=1`
                  )
                }
              >
                <ArrowRightLeft className="size-4" />
                Transfer
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">
          {assignment.device.name}
        </h1>
        <span className="font-mono text-xs text-muted-foreground">
          {assignment.device.assetId}
        </span>
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Active" : assignment.closedReason ?? "Returned"}
        </Badge>
      </div>

      <Separator />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Device</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{assignment.device.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Asset ID</span>
              <span className="font-mono text-xs">{assignment.device.assetId}</span>
            </div>
            {assignment.device.model && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span>{assignment.device.model}</span>
              </div>
            )}
            {assignment.device.serialNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serial Number</span>
                <span className="font-mono text-xs">{assignment.device.serialNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span>{assignment.device.deviceType.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                style={{
                  borderColor: assignment.device.status.color,
                  color: assignment.device.status.color,
                }}
              >
                {assignment.device.status.name}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Assigned To</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>
                {assignment.user.firstName} {assignment.user.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{assignment.user.email}</span>
            </div>
            {assignment.user.department && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span>{assignment.user.department.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Dates</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned Date</span>
              <span>{formatDate(assignment.assignmentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Return</span>
              <span>{formatDate(assignment.expectedReturnDate)}</span>
            </div>
            {assignment.returnDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actual Return</span>
                <span>{formatDate(assignment.returnDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Details</h3>
          <div className="grid gap-3 text-sm">
            {assignment.assignedBy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned By</span>
                <span>
                  {assignment.assignedBy.firstName}{" "}
                  {assignment.assignedBy.lastName}
                </span>
              </div>
            )}
            {assignment.returnedBy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Returned By</span>
                <span>
                  {assignment.returnedBy.firstName}{" "}
                  {assignment.returnedBy.lastName}
                </span>
              </div>
            )}
            {assignment.conditionBefore && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition Before</span>
                <span>{assignment.conditionBefore}</span>
              </div>
            )}
            {assignment.conditionAfter && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition After</span>
                <span>{assignment.conditionAfter}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {assignment.notes && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {assignment.notes}
            </p>
          </div>
        </>
      )}

      <Separator />

      <AttachmentSection assignmentId={id} />
    </div>
  );
}
