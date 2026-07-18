import { z } from "zod";

export const DepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z.string().max(20).optional().nullable(),
});

export const LocationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  building: z.string().max(100).optional().nullable(),
  floor: z.string().max(20).optional().nullable(),
  room: z.string().max(50).optional().nullable(),
});

export const ManufacturerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  website: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\/.+\..+/.test(val),
      { message: "Invalid URL format" }
    ),
});

export const VendorSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  contactName: z.string().max(200).optional().nullable(),
  email: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Invalid email format" }
    ),
  phone: z.string().max(20).optional().nullable(),
  website: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\/.+\..+/.test(val),
      { message: "Invalid URL format" }
    ),
});

export const DeviceTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional().nullable(),
  category: z.string().max(100).optional().nullable(),
});

export const DeviceStatusSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z
    .string()
    .min(1, "Color is required")
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g. #FF0000)"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const DeviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  assetId: z.string().min(1, "Asset ID is required").max(50),
  deviceTypeId: z.string().uuid(),
  manufacturerId: z.string().uuid().optional().nullable(),
  model: z.string().max(200).optional().nullable(),
  serialNumber: z.string().max(200).optional().nullable(),
  inventoryNumber: z.string().max(100).optional().nullable(),
  hostname: z.string().max(200).optional().nullable(),
  ipAddress: z
    .string()
    .max(45)
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val ||
        /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(val),
      { message: "Invalid IP address format" }
    ),
  macAddress: z
    .string()
    .max(17)
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val ||
        /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(val),
      { message: "Invalid MAC address format" }
    ),
  statusId: z.string().uuid(),
  departmentId: z.string().uuid().optional().nullable(),
  locationId: z.string().uuid().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  warrantyExpiration: z.coerce.date().optional().nullable(),
  purchasePrice: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UserSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z
    .string()
    .min(1, "Email is required")
    .max(255)
    .email("Invalid email format"),
});

export const AssignmentSchema = z.object({
  deviceId: z.string().uuid(),
  userId: z.string().uuid(),
  assignmentDate: z.coerce.date(),
});
