import { type UserRole, type UserStatus } from "@prisma/client";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string | null;
}

export interface UserProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  departmentId: string | null;
  jobTitle: string | null;
  officeLocation: string | null;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: Date;
  department: DepartmentInfo | null;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}
