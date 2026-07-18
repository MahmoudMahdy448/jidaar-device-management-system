"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, RotateCcw } from "lucide-react";

interface Assignment {
  id: string;
  deviceId: string;
  userId: string;
  assignmentDate: string;
  expectedReturnDate: string | null;
  returnDate: string | null;
  closedReason: string | null;
  conditionBefore: string | null;
  conditionAfter: string | null;
  notes: string | null;
  device: {
    id: string;
    name: string;
    assetId: string;
    status: { id: string; name: string; color: string };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  assignedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  returnedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface AssignmentTableProps {
  assignments: Assignment[];
  onReturn?: (id: string, deviceName: string) => void;
  onTransfer?: (id: string, deviceName: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isOverdue(expectedReturnDate: string | null, returnDate: string | null): boolean {
  if (!expectedReturnDate || returnDate) return false;
  return new Date(expectedReturnDate) < new Date();
}

export function AssignmentTable({
  assignments,
  onReturn,
  onTransfer,
}: AssignmentTableProps) {
  const router = useRouter();

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-sm text-muted-foreground">No assignments found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Return Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => {
            const active = !assignment.returnDate;
            const overdue = isOverdue(
              assignment.expectedReturnDate,
              assignment.returnDate
            );

            return (
              <TableRow
                key={assignment.id}
                className="cursor-pointer"
                onClick={() => router.push(`/assignments/${assignment.id}`)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{assignment.device.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {assignment.device.assetId}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {assignment.user.firstName} {assignment.user.lastName}
                </TableCell>
                <TableCell>{formatDate(assignment.assignmentDate)}</TableCell>
                <TableCell>{formatDate(assignment.expectedReturnDate)}</TableCell>
                <TableCell>
                  {active ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    formatDate(assignment.returnDate)
                  )}
                </TableCell>
                <TableCell>
                  {overdue ? (
                    <Badge variant="destructive">
                      <span className="flex items-center gap-1">
                        Overdue
                      </span>
                    </Badge>
                  ) : active ? (
                    <Badge variant="default">Open</Badge>
                  ) : (
                    <Badge variant="outline">{assignment.closedReason ?? "Closed"}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {active && (
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onReturn && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Return"
                          onClick={() =>
                            onReturn(assignment.id, assignment.device.name)
                          }
                        >
                          <RotateCcw className="size-3.5" />
                        </Button>
                      )}
                      {onTransfer && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Transfer"
                          onClick={() =>
                            onTransfer(assignment.id, assignment.device.name)
                          }
                        >
                          <ArrowRightLeft className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
