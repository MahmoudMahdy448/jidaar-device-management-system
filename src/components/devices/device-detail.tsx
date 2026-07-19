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
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Building2, User, Paperclip } from "lucide-react";

interface DeviceDetailProps {
  device: Record<string, unknown> & {
    id: string;
    name: string;
    assetId: string;
    model?: string | null;
    serialNumber?: string | null;
    inventoryNumber?: string | null;
    hostname?: string | null;
    ipAddress?: string | null;
    macAddress?: string | null;
    purchaseDate?: string | null;
    warrantyExpiration?: string | null;
    purchasePrice?: number | null;
    notes?: string | null;
    specifications?: Record<string, unknown> | null;
    deviceType: { id: string; name: string };
    status: { id: string; name: string; color: string };
    department?: { id: string; name: string } | null;
    location?: { id: string; name: string } | null;
    manufacturer?: { id: string; name: string } | null;
    vendor?: { id: string; name: string } | null;
    assignments: Array<{
      id: string;
      assignmentDate: string;
      returnDate?: string | null;
      expectedReturnDate?: string | null;
      closedReason?: string | null;
      notes?: string | null;
      user: { id: string; firstName: string; lastName: string; email: string };
      assignedBy?: { id: string; firstName: string; lastName: string } | null;
      returnedBy?: { id: string; firstName: string; lastName: string } | null;
      _count?: { attachments: number };
    }>;
  };
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
}

function isWarrantyActive(
  warrantyExpiration: string | null | undefined
): boolean {
  if (!warrantyExpiration) return false;
  return new Date(warrantyExpiration) > new Date();
}

export function DeviceDetail({ device }: DeviceDetailProps) {
  const specifications = (device.specifications as Record<string, unknown>) ?? {};
  const specEntries = Object.entries(specifications).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  const warrantyActive = isWarrantyActive(device.warrantyExpiration);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">
              {device.name}
            </h1>
            <span className="font-mono text-xs text-muted-foreground">
              {device.assetId}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="outline"
              style={{
                borderColor: device.status.color,
                color: device.status.color,
              }}
            >
              {device.status.name}
            </Badge>
            <Badge variant="secondary">{device.deviceType.name}</Badge>
            {warrantyActive && <Badge variant="secondary">Warranty Active</Badge>}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">General Information</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span>{device.model ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serial Number</span>
              <span className="font-mono text-xs">{device.serialNumber ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inventory Number</span>
              <span className="font-mono text-xs">{device.inventoryNumber ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manufacturer</span>
              <span>{device.manufacturer?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor</span>
              <span>{device.vendor?.name ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Network</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hostname</span>
              <span className="font-mono text-xs">{device.hostname ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-mono text-xs">{device.ipAddress ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MAC Address</span>
              <span className="font-mono text-xs">{device.macAddress ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Location</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <span>{device.department?.name ?? "No department"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <span>{device.location?.name ?? "No location"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-foreground">Purchase Info</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span>Purchased: {formatDate(device.purchaseDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span>{formatCurrency(device.purchasePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Warranty Exp.</span>
              <span>{formatDate(device.warrantyExpiration)}</span>
            </div>
          </div>
        </div>
      </div>

      {specEntries.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-foreground">Specifications</h3>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {specEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between rounded-md border px-3 py-2">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {device.notes && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {device.notes}
            </p>
          </div>
        </>
      )}

      <Separator />

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">Assignment History</h3>
        {device.assignments.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {device.assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span>
                          {assignment.user.firstName} {assignment.user.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(assignment.assignmentDate)}</TableCell>
                    <TableCell>{formatDate(assignment.returnDate)}</TableCell>
                    <TableCell>
                      {assignment.returnDate ? (
                        <Badge variant="secondary">
                          {assignment.closedReason ?? "Returned"}
                        </Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignment.assignedBy
                        ? `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`
                        : "\u2014"}
                    </TableCell>
                    <TableCell>
                      {assignment._count && assignment._count.attachments > 0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <Paperclip className="size-3" />
                          {assignment._count.attachments}
                        </Badge>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
