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
import type { Device } from "@prisma/client";

interface DeviceWithType extends Device {
  deviceType: { name: string };
  status: { name: string; color: string };
  department?: { name: string } | null;
  location?: { name: string } | null;
  assignments: {
    user: { firstName: string; lastName: string };
  }[];
}

interface DeviceTableProps {
  devices: DeviceWithType[];
}

function isWarrantyActive(warrantyExpiration: Date | string | null): boolean {
  if (!warrantyExpiration) return false;
  return new Date(warrantyExpiration) > new Date();
}

export function DeviceTable({ devices }: DeviceTableProps) {
  const router = useRouter();

  if (devices.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-sm text-muted-foreground">No devices found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned to</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-20">Warranty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => {
            const currentAssignment = device.assignments[0];
            const warrantyActive = isWarrantyActive(device.warrantyExpiration);

            return (
              <TableRow
                key={device.id}
                className="cursor-pointer"
                onClick={() => router.push(`/devices/${device.id}`)}
              >
                <TableCell className="font-mono text-xs">
                  {device.assetId}
                </TableCell>
                <TableCell className="font-medium">{device.name}</TableCell>
                <TableCell>{device.deviceType.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: device.status.color,
                      color: device.status.color,
                    }}
                  >
                    {device.status.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  {currentAssignment
                    ? `${currentAssignment.user.firstName} ${currentAssignment.user.lastName}`
                    : "—"}
                </TableCell>
                <TableCell>{device.location?.name ?? "—"}</TableCell>
                <TableCell>
                  {warrantyActive ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
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
