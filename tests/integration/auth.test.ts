import { describe, it, expect } from "vitest";

// Integration tests — require a running database and Next.js server.
// Run with: pnpm test -- --run tests/integration/auth.test.ts
// Set DATABASE_URL in .env before running.

describe("Auth API Integration", () => {
  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  it("returns session for valid credentials", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: "admin@jidaar.com",
        password: "password123",
        csrfToken: "",
        callbackUrl: "/dashboard",
        json: "true",
      }),
    });
    expect(res.status).toBeLessThanOrEqual(302);
  });

  it("returns error for invalid credentials", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: "wrong@example.com",
        password: "wrongpassword",
        csrfToken: "",
        callbackUrl: "/dashboard",
        json: "true",
      }),
    });
    expect(res.status).not.toBe(200);
  });

  it("returns 401 for unauthenticated access to protected route", async () => {
    const res = await fetch(`${BASE_URL}/api/devices`, {
      headers: { Cookie: "" },
    });
    expect(res.status).toBe(401);
  });
});
