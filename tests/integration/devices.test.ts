import { describe, it, expect } from "vitest";

// Integration tests — require a running database and Next.js server.
// Run with: pnpm test -- --run tests/integration/devices.test.ts
// Set DATABASE_URL in .env before running.

describe("Device API Integration", () => {
  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  it("creates a device and returns 201", async () => {
    const res = await fetch(`${BASE_URL}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Integration Test Device",
        assetId: `INT-TEST-${Date.now()}`,
        deviceTypeId: "550e8400-e29b-41d4-a716-446655440000",
        statusId: "550e8400-e29b-41d4-a716-446655440001",
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(data.name).toBe("Integration Test Device");
  });

  it("lists devices with pagination", async () => {
    const res = await fetch(`${BASE_URL}/api/devices?page=1&pageSize=10`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("total");
    expect(Array.isArray(data.items)).toBe(true);
  });

  it("gets device by ID with relations", async () => {
    const listRes = await fetch(`${BASE_URL}/api/devices?page=1&pageSize=1`);
    const { items } = await listRes.json();
    if (items.length === 0) return;

    const res = await fetch(`${BASE_URL}/api/devices/${items[0].id}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("deviceType");
  });

  it("updates a device", async () => {
    const listRes = await fetch(`${BASE_URL}/api/devices?page=1&pageSize=1`);
    const { items } = await listRes.json();
    if (items.length === 0) return;

    const res = await fetch(`${BASE_URL}/api/devices/${items[0].id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Device Name" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Updated Device Name");
  });

  it("soft-deletes a device", async () => {
    const createRes = await fetch(`${BASE_URL}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "To Be Deleted",
        assetId: `DEL-${Date.now()}`,
        deviceTypeId: "550e8400-e29b-41d4-a716-446655440000",
        statusId: "550e8400-e29b-41d4-a716-446655440001",
      }),
    });
    const device = await createRes.json();

    const res = await fetch(`${BASE_URL}/api/devices/${device.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });
});
