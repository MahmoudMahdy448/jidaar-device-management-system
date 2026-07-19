import { describe, it, expect } from "vitest";
import {
  DeviceSchema,
  CreateUserSchema,
  DepartmentSchema,
  AssignmentSchema,
} from "@/lib/validations";

const validUUID = "550e8400-e29b-41d4-a716-446655440000";
const invalidUUID = "not-a-uuid";

describe("DeviceSchema", () => {
  const validDevice = {
    name: "Test Laptop",
    assetId: "LAP-001",
    deviceTypeId: validUUID,
    statusId: validUUID,
    ipAddress: "192.168.1.100",
    macAddress: "AA:BB:CC:DD:EE:FF",
    purchaseDate: "2024-01-15",
    warrantyExpiration: "2027-01-15",
  };

  it("passes with valid device data", () => {
    const result = DeviceSchema.safeParse(validDevice);
    expect(result.success).toBe(true);
  });

  it("fails when name is missing", () => {
    const data = { ...validDevice };
    delete data.name;
    const result = DeviceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails when assetId is missing", () => {
    const data = { ...validDevice };
    delete data.assetId;
    const result = DeviceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails when deviceTypeId is missing", () => {
    const data = { ...validDevice };
    delete data.deviceTypeId;
    const result = DeviceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails when statusId is missing", () => {
    const data = { ...validDevice };
    delete data.statusId;
    const result = DeviceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails with invalid MAC address", () => {
    const result = DeviceSchema.safeParse({ ...validDevice, macAddress: "invalid-mac" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid IP address", () => {
    const result = DeviceSchema.safeParse({ ...validDevice, ipAddress: "999.999.999.999" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid deviceTypeId UUID", () => {
    const result = DeviceSchema.safeParse({ ...validDevice, deviceTypeId: invalidUUID });
    expect(result.success).toBe(false);
  });

  it("passes without optional fields", () => {
    const minimal = {
      name: "Test Device",
      assetId: "DEV-001",
      deviceTypeId: validUUID,
      statusId: validUUID,
    };
    const result = DeviceSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });
});

describe("UserSchema", () => {
  const validUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    employeeId: "EMP-001",
    password: "password123",
  };

  it("passes with valid user data", () => {
    const result = CreateUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("fails when email is missing", () => {
    const data = { ...validUser };
    delete data.email;
    const result = CreateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails with invalid email", () => {
    const result = CreateUserSchema.safeParse({ ...validUser, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("fails when firstName is missing", () => {
    const data = { ...validUser };
    delete data.firstName;
    const result = CreateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails when lastName is missing", () => {
    const data = { ...validUser };
    delete data.lastName;
    const result = CreateUserSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("DepartmentSchema", () => {
  it("passes with valid department data", () => {
    const result = DepartmentSchema.safeParse({ name: "Engineering" });
    expect(result.success).toBe(true);
  });

  it("passes with name and code", () => {
    const result = DepartmentSchema.safeParse({ name: "Engineering", code: "ENG" });
    expect(result.success).toBe(true);
  });

  it("fails when name is missing", () => {
    const result = DepartmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("fails when name is empty", () => {
    const result = DepartmentSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("AssignmentSchema", () => {
  const validAssignment = {
    deviceId: validUUID,
    userId: validUUID,
    assignmentDate: "2024-06-01",
  };

  it("passes with valid assignment data", () => {
    const result = AssignmentSchema.safeParse(validAssignment);
    expect(result.success).toBe(true);
  });

  it("fails when deviceId is missing", () => {
    const data = { ...validAssignment };
    delete data.deviceId;
    const result = AssignmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails when userId is missing", () => {
    const data = { ...validAssignment };
    delete data.userId;
    const result = AssignmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails when assignmentDate is missing", () => {
    const data = { ...validAssignment };
    delete data.assignmentDate;
    const result = AssignmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("fails with invalid deviceId UUID", () => {
    const result = AssignmentSchema.safeParse({ ...validAssignment, deviceId: invalidUUID });
    expect(result.success).toBe(false);
  });

  it("passes with optional fields", () => {
    const full = {
      ...validAssignment,
      assignedById: validUUID,
      expectedReturnDate: "2024-12-31",
      conditionBefore: "Good",
      notes: "Test assignment",
    };
    const result = AssignmentSchema.safeParse(full);
    expect(result.success).toBe(true);
  });
});
