import { describe, it, expect } from "vitest";

// Integration tests — require a running database and Next.js server.
// Run with: pnpm test -- --run tests/integration/users.test.ts
// Set DATABASE_URL in .env before running.

describe("User API Integration", () => {
  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  it("creates a user with hashed password", async () => {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        email: `test-user-${Date.now()}@example.com`,
        employeeId: `EMP-${Date.now()}`,
        role: "TECHNICIAN",
        password: "securePassword123",
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(data.passwordHash).toBeDefined();
    // passwordHash should not be the plaintext password
    expect(data.passwordHash).not.toBe("securePassword123");
  });

  it("returns 409 when deleting user with open assignments", async () => {
    const createRes = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Assignee",
        lastName: "User",
        email: `assignee-${Date.now()}@example.com`,
        employeeId: `EMP-ASS-${Date.now()}`,
        role: "READ_ONLY",
        password: "password123",
      }),
    });
    const user = await createRes.json();

    // Assign a device to the user first
    await fetch(`${BASE_URL}/api/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: "550e8400-e29b-41d4-a716-446655440003",
        userId: user.id,
        assignmentDate: "2024-06-01",
      }),
    });

    // Try to delete the user with open assignments
    const deleteRes = await fetch(`${BASE_URL}/api/users/${user.id}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(409);
  });
});
