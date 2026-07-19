import { z } from "zod";

const nullableUuid = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.string().uuid().optional().nullable()
);
const nullableDate = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.coerce.date().optional().nullable()
);
const nullableNumber = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.coerce.number().min(0).optional().nullable()
);
const nullableString = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.string().trim().max(2000).optional().nullable()
);
const nullablePhone = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.string().trim().max(20).optional().nullable()
);

export const DepartmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  code: z.string().trim().max(20).optional().nullable(),
});

export const LocationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  building: z.string().trim().max(100).optional().nullable(),
  floor: z.string().trim().max(20).optional().nullable(),
  room: z.string().trim().max(50).optional().nullable(),
});

export const ManufacturerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  website: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\/.+\..+/.test(val),
      { message: "Invalid URL format" }
    ),
});

export const VendorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  contactName: z.string().trim().max(200).optional().nullable(),
  email: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Invalid email format" }
    ),
  phone: z.string().trim().max(20).optional().nullable(),
  website: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\/.+\..+/.test(val),
      { message: "Invalid URL format" }
    ),
});

export const DeviceTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
});

export const DeviceStatusSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  color: z
    .string()
    .trim()
    .min(1, "Color is required")
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g. #FF0000)"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const DeviceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  assetId: z.string().trim().min(1, "Asset ID is required").max(50),
  deviceTypeId: z.string().uuid("Invalid device type"),
  manufacturerId: nullableUuid,
  model: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(200).optional().nullable()
  ),
  serialNumber: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(200).optional().nullable()
  ),
  inventoryNumber: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(100).optional().nullable()
  ),
  hostname: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(200).optional().nullable()
  ),
  ipAddress: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(45).optional().nullable()
  ).refine(
    (val) =>
      !val ||
      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(val),
    { message: "Invalid IP address format" }
  ),
  macAddress: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(17).optional().nullable()
  ).refine(
    (val) =>
      !val ||
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(val),
    { message: "Invalid MAC address format" }
  ),
  statusId: z.string().uuid("Invalid status"),
  departmentId: nullableUuid,
  locationId: nullableUuid,
  vendorId: nullableUuid,
  purchaseDate: nullableDate,
  warrantyExpiration: nullableDate,
  purchasePrice: nullableNumber,
  notes: nullableString,
  specifications: z.record(z.string(), z.string()).optional(),
  assignedUserId: nullableUuid,
});

export const CreateUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().min(1, "Email is required").max(255).email("Invalid email format"),
  phone: nullablePhone,
  employeeId: z.string().trim().min(1, "Employee ID is required").max(50),
  departmentId: nullableUuid,
  jobTitle: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(100).optional().nullable()
  ),
  officeLocation: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(100).optional().nullable()
  ),
  role: z.enum(["ADMIN", "TECHNICIAN", "READ_ONLY"]).default("READ_ONLY"),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).default("ACTIVE"),
  notes: nullableString,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const EditUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().min(1, "Email is required").max(255).email("Invalid email format"),
  phone: nullablePhone,
  employeeId: z.string().trim().min(1, "Employee ID is required").max(50),
  departmentId: nullableUuid,
  jobTitle: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(100).optional().nullable()
  ),
  officeLocation: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(100).optional().nullable()
  ),
  role: z.enum(["ADMIN", "TECHNICIAN", "READ_ONLY"]),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]),
  notes: nullableString,
});

export const AssignmentSchema = z
  .object({
    deviceId: z.string().uuid("Invalid device"),
    userId: z.string().uuid("Invalid user"),
    assignedById: z.string().uuid().optional().nullable(),
    assignmentDate: z.coerce.date(),
    expectedReturnDate: nullableDate,
    conditionBefore: z.preprocess(
      (val) => (val === "" || val === undefined ? null : val),
      z.string().trim().max(500).optional().nullable()
    ),
    notes: nullableString,
  })
  .refine(
    (data) =>
      !data.expectedReturnDate || data.expectedReturnDate >= data.assignmentDate,
    {
      message: "Expected return date must be on or after the assignment date",
      path: ["expectedReturnDate"],
    }
  );

export const ReturnAssignmentSchema = z.object({
  returnDate: z.coerce.date(),
  closedReason: z.enum(["RETURNED", "LOST", "RETIRED", "DEACTIVATED"]),
  conditionAfter: z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.string().trim().max(500).optional().nullable()
  ),
  needsMaintenance: z.boolean().optional().default(false),
  notes: nullableString,
});

export const TransferAssignmentSchema = z.object({
  assignmentId: z.string().uuid("Invalid assignment"),
  newUserId: z.string().uuid("Invalid user"),
  transferDate: z.coerce.date(),
  notes: nullableString,
});
