"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Building2, MapPin, Briefcase } from "lucide-react";
import { useUserAssignments } from "@/hooks/use-users";

interface UserDetailProps {
  user: Record<string, unknown> & {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    jobTitle?: string | null;
    officeLocation?: string | null;
    role: string;
    status: string;
    notes?: string | null;
    createdAt: string;
    department?: { id: string; name: string } | null;
  };
}

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  TECHNICIAN: "Technician",
  READ_ONLY: "Read Only",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  TERMINATED: "Terminated",
};

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  TERMINATED: "destructive",
};

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UserDetail({ user }: UserDetailProps) {
  const { assignments, isLoading: assignmentsLoading } = useUserAssignments(user.id);
  const currentAssignments = (assignments as Array<Record<string, unknown>>).filter(
    (a) => !a.returnDate
  );
  const pastAssignments = (assignments as Array<Record<string, unknown>>).filter(
    (a) => !!a.returnDate
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <User className="size-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </h1>
            <Badge variant={statusBadgeVariant[user.status] ?? "secondary"}>
              {statusLabels[user.status] ?? user.status}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{user.jobTitle ?? "No job title"}</span>
            {user.department && (
              <>
                <span>·</span>
                <span>{user.department.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Personal Information</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name</span>
              <span className="ml-auto">{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email</span>
              <span className="ml-auto">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone</span>
              <span className="ml-auto">{user.phone ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Employment</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Employee ID</span>
              <span className="ml-auto font-mono text-xs">{user.employeeId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Department</span>
              <span className="ml-auto">{user.department?.name ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Job Title</span>
              <span className="ml-auto">{user.jobTitle ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Office</span>
              <span className="ml-auto">{user.officeLocation ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Role</span>
              <span className="ml-auto">{roleLabels[user.role] ?? user.role}</span>
            </div>
          </div>
        </div>
      </div>

      {user.notes && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {user.notes}
            </p>
          </div>
        </>
      )}

      <Separator />

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">
          Current Assigned Devices
        </h3>
        {assignmentsLoading ? (
          <div className="rounded-xl border p-8 text-center">
            <p className="text-sm text-muted-foreground">Loading assignments...</p>
          </div>
        ) : currentAssignments.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            <p className="text-sm text-muted-foreground">No devices currently assigned.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentAssignments.map((assignment) => {
              const device = assignment.device as Record<string, unknown>;
              const deviceStatus = device.status as Record<string, unknown> | undefined;
              return (
                <Card key={assignment.id as string}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">
                        {(device as { name: string }).name}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {(device as { assetId: string }).assetId}
                      </p>
                    </div>
                    {deviceStatus && (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: deviceStatus.color as string,
                          color: deviceStatus.color as string,
                        }}
                      >
                        {deviceStatus.name as string}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">Assignment History</h3>
        {assignmentsLoading ? (
          <div className="rounded-xl border p-8 text-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : pastAssignments.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            <p className="text-sm text-muted-foreground">No past assignments.</p>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastAssignments.map((assignment) => {
                  const device = assignment.device as Record<string, unknown>;
                  return (
                    <TableRow key={assignment.id as string}>
                      <TableCell>
                        <div>
                          <span className="font-medium text-sm">
                            {(device as { name: string }).name}
                          </span>
                          <span className="ml-2 font-mono text-xs text-muted-foreground">
                            {(device as { assetId: string }).assetId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(assignment.assignmentDate as string)}</TableCell>
                      <TableCell>{formatDate(assignment.returnDate as string)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(assignment.closedReason as string) ?? "Returned"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
