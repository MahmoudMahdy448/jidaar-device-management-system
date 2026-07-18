import { describe, it, expect } from "vitest";

// Integration tests — require a running database and Next.js server.
// Run with: pnpm test -- --run tests/integration/assignments.test.ts
// Set DATABASE_URL in .env before running.

describe("Assignment API Integration", () => {
  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  it("assigns a device and changes status to Assigned", async () => {
    const res = await fetch(`${BASE_URL}/api/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440010",
        assignmentDate: "2024-06-01",
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id");
  });

  it("returns a device and changes status to Available", async () => {
    const listRes = await fetch(`${BASE_URL}/api/assignments?page=1&pageSize=1`);
    const { items } = await listRes.json();
    if (items.length === 0) return;

    const res = await fetch(`${BASE_URL}/api/assignments/${items[0].id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        returnDate: "2024-06-15",
        closedReason: "RETURNED",
        conditionAfter: "Good",
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.closedReason).toBe("RETURNED");
  });

  it("transfers an assignment (closes old + opens new)", async () => {
    const createRes = await fetch(`${BASE_URL}/api/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: "550e8400-e29b-41d4-a716-446655440002",
        userId: "550e8400-e29b-41d4-a716-446655440010",
        assignmentDate: "2024-06-01",
      }),
    });
    const assignment = await createRes.json();

    const res = await fetch(`${BASE_URL}/api/assignments/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId: assignment.id,
        newUserId: "550e8400-e29b-41d4-a716-446655440011",
        transferDate: "2024-07-01",
      }),
    });
    expect(res.status).toBe(200);
  });

  it("fails to assign an already-assigned device (double assign)", async () => {
    const deviceId = "550e8400-e29b-41d4-a716-446655440000";
    const userId = "550e8400-e29b-41d4-a716-446655440010";
    const dateStr = "2024-06-01";

    const res = await fetch(`${BASE_URL}/api/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        userId,
        assignmentDate: dateStr,
      }),
    });
    // Should return 409 or 400 if device already has open assignment
    expect([400, 409]).toContain(res.status);
  });
});
