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

interface UserWithType {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  jobTitle?: string | null;
  role: string;
  status: string;
  createdAt: string;
  department?: { id: string; name: string } | null;
}

interface UserTableProps {
  users: UserWithType[];
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  TECHNICIAN: "secondary",
  READ_ONLY: "outline",
};

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  TERMINATED: "destructive",
};

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

export function UserTable({ users }: UserTableProps) {
  const router = useRouter();

  if (users.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-sm text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="cursor-pointer"
              onClick={() => router.push(`/users/${user.id}`)}
            >
              <TableCell className="font-mono text-xs">
                {user.employeeId}
              </TableCell>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={roleBadgeVariant[user.role] ?? "outline"}>
                  {roleLabels[user.role] ?? user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant[user.status] ?? "secondary"}>
                  {statusLabels[user.status] ?? user.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
