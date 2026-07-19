import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError, ValidationError, ConflictError } from "@/lib/errors";
import { DeviceSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity-log";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
    const search = searchParams.get("search") ?? "";
    const statusId = searchParams.get("statusId");
    const deviceTypeId = searchParams.get("deviceTypeId");
    const departmentId = searchParams.get("departmentId");
    const manufacturerId = searchParams.get("manufacturerId");
    const locationId = searchParams.get("locationId");
    const vendorId = searchParams.get("vendorId");
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { assetId: { contains: search } },
        { model: { contains: search } },
        { serialNumber: { contains: search } },
        { ipAddress: { contains: search } },
        { macAddress: { contains: search } },
        { manufacturer: { name: { contains: search } } },
      ];
    }

    if (statusId) where.statusId = statusId;
    if (deviceTypeId) where.deviceTypeId = deviceTypeId;
    if (departmentId) where.departmentId = departmentId;
    if (manufacturerId) where.manufacturerId = manufacturerId;
    if (locationId) where.locationId = locationId;
    if (vendorId) where.vendorId = vendorId;

    const allowedSortFields: Record<string, string> = {
      name: "name",
      assetId: "assetId",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    };
    const orderBy = { [allowedSortFields[sortBy] ?? "createdAt"]: sortOrder };

    const [total, devices] = await Promise.all([
      prisma.device.count({ where }),
      prisma.device.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          deviceType: true,
          status: true,
          department: true,
          location: true,
          manufacturer: true,
          vendor: true,
          assignments: {
            where: { returnDate: null },
            take: 1,
            include: { user: true },
          },
        },
      }),
    ]);

    return apiSuccess(devices, { page, pageSize, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("devices:write");
    const body = await request.json();
    const parsed = DeviceSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ValidationError("Validation failed", details);
    }

    const { assignedUserId, ...deviceData } = parsed.data;

    const device = await prisma.$transaction(async (tx) => {
      const existing = await tx.device.findFirst({
        where: {
          OR: [
            { assetId: deviceData.assetId },
            ...(deviceData.serialNumber ? [{ serialNumber: deviceData.serialNumber }] : []),
          ],
        },
      });

      if (existing) {
        const field = existing.assetId === deviceData.assetId ? "assetId" : "serialNumber";
        throw new ConflictError(`A device with this ${field} already exists`);
      }

      const newDevice = await tx.device.create({ data: deviceData });

      if (assignedUserId) {
        const assignee = await tx.user.findFirst({
          where: { id: assignedUserId, deletedAt: null },
        });
        if (!assignee) {
          throw new ValidationError("Selected user not found", { assignedUserId: "User not found" });
        }
        if (assignee.status !== "ACTIVE") {
          throw new ConflictError("Cannot assign device to an inactive user");
        }

        await tx.assignment.create({
          data: {
            deviceId: newDevice.id,
            userId: assignedUserId,
            assignedById: session.user.id,
            assignmentDate: new Date(),
          },
        });
      }

      return newDevice;
    });

    await logActivity({
      entityType: "device",
      entityId: device.id,
      action: "created",
    });

    return apiSuccess(device);
  } catch (error) {
    return handleApiError(error);
  }
}
