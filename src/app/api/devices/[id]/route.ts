import { apiSuccess, handleApiError, NotFoundError, ConflictError } from "@/lib/errors";
import { DeviceSchema } from "@/lib/validations";
import { logActivity, computeChanges } from "@/lib/activity-log";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const DEVICE_TRACKED_FIELDS = [
  "name",
  "assetId",
  "deviceTypeId",
  "manufacturerId",
  "model",
  "serialNumber",
  "inventoryNumber",
  "hostname",
  "ipAddress",
  "macAddress",
  "statusId",
  "departmentId",
  "locationId",
  "vendorId",
  "purchaseDate",
  "warrantyExpiration",
  "purchasePrice",
  "notes",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;

    const device = await prisma.device.findUnique({
      where: { id },
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
    });

    if (!device || device.deletedAt) {
      throw new NotFoundError("Device", id);
    }

    const activityLogs = await prisma.activityLog.findMany({
      where: { entityType: "device", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { actor: true },
    });

    return apiSuccess({ ...device, activityLogs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("devices:write");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const body = await request.json();
    const parsed = DeviceSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.device.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundError("Device", id);
    }

    const duplicate = await prisma.device.findFirst({
      where: {
        id: { not: id },
        deletedAt: null,
        OR: [
          { assetId: parsed.data.assetId },
          ...(parsed.data.serialNumber ? [{ serialNumber: parsed.data.serialNumber }] : []),
        ],
      },
    });

    if (duplicate) {
      const field = duplicate.assetId === parsed.data.assetId ? "assetId" : "serialNumber";
      throw new ConflictError(`A device with this ${field} already exists`);
    }

    const oldRecord = Object.fromEntries(
      DEVICE_TRACKED_FIELDS.map((f) => [f, (existing as Record<string, unknown>)[f]])
    );
    const newRecord = parsed.data;

    const changes = computeChanges(
      oldRecord,
      newRecord as Record<string, unknown>,
      DEVICE_TRACKED_FIELDS
    );

    const device = await prisma.device.update({
      where: { id },
      data: parsed.data,
    });

    if (changes) {
      await logActivity({
        entityType: "device",
        entityId: id,
        action: "updated",
        changes,
      });
    }

    return apiSuccess(device);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("devices:delete");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;

    const existing = await prisma.device.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundError("Device", id);
    }

    const openAssignment = await prisma.assignment.findFirst({
      where: { deviceId: id, returnDate: null, deletedAt: null },
    });

    if (openAssignment) {
      throw new ConflictError(
        "Cannot delete device with an active assignment. Return or transfer the device first.",
        { assignmentId: openAssignment.id }
      );
    }

    await prisma.device.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logActivity({
      entityType: "device",
      entityId: id,
      action: "deleted",
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
