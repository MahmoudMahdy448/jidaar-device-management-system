import { auth } from "@/lib/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { UserRole } from "@prisma/client";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
}

export interface Session {
  user: SessionUser;
}

/**
 * Retrieves the current session. Throws UnauthorizedError if not authenticated.
 */
export async function requireSession(): Promise<Session> {
  let session;
  try {
    session = await auth();
  } catch (err) {
    console.error("Auth() threw an error:", err);
    throw new UnauthorizedError();
  }
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session as Session;
}

/**
 * Retrieves the current session and verifies the user has the required permission.
 * Throws UnauthorizedError if not authenticated, ForbiddenError if lacking permission.
 */
export async function requirePermission(permission: Permission): Promise<Session> {
  const session = await requireSession();
  const role = session.user.role as UserRole;

  if (!hasPermission(role, permission)) {
    throw new ForbiddenError();
  }

  return session;
}
