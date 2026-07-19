import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { UserRole } from "@prisma/client";

const protectedPaths = [
  "/dashboard",
  "/devices",
  "/users",
  "/assignments",
  "/departments",
  "/locations",
  "/manufacturers",
  "/vendors",
  "/settings",
];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isProtectedApi(pathname: string): boolean {
  if (!pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/api/auth")) return false;
  return true;
}

function getRequiredPermission(method: string, pathname: string): Permission | null {
  if (!pathname.startsWith("/api/")) return null;

  const segments = pathname.replace("/api/", "").split("/").filter(Boolean);
  const resource = segments[0];

  if (!resource) return null;

  const isWrite = method === "POST" || method === "PUT" || method === "PATCH";
  const isDelete = method === "DELETE";

  if (isDelete) return `${resource}:delete` as Permission;
  if (isWrite) return `${resource}:write` as Permission;
  return `${resource}:read` as Permission;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (isProtectedPath(pathname) || isProtectedApi(pathname)) {
    if (!isLoggedIn) {
      if (isProtectedApi(pathname)) {
        return NextResponse.json(
          { data: null, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (req.auth?.user as { role?: UserRole })?.role;

    if (userRole && isProtectedApi(pathname)) {
      const requiredPermission = getRequiredPermission(req.method, pathname);

      if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
          { status: 403 }
        );
      }
    }
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
