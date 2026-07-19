import { apiSuccess, handleApiError, NotFoundError, ConflictError } from "@/lib/errors";
import { DeviceTypeSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const deviceType = await prisma.deviceType.findUnique({
      where: { id },
      include: { _count: { select: { devices: true } } },
    });

    if (!deviceType) {
      throw new NotFoundError("Device type", id);
    }

    return apiSuccess(deviceType);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("device-types:write");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const body = await request.json();
    const parsed = DeviceTypeSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.deviceType.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Device type", id);
    }

    const duplicate = await prisma.deviceType.findFirst({
      where: {
        id: { not: id },
        name: parsed.data.name,
      },
    });

    if (duplicate) {
      throw new ConflictError("A device type with this name already exists");
    }

    const deviceType = await prisma.deviceType.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(deviceType);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("device-types:delete");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const existing = await prisma.deviceType.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Device type", id);
    }

    const deviceCount = await prisma.device.count({
      where: { deviceTypeId: id },
    });

    if (deviceCount > 0) {
      throw new ConflictError(
        `Cannot delete: this device type is referenced by ${deviceCount} ${deviceCount === 1 ? "record" : "records"}`,
        { referenceCount: String(deviceCount) }
      );
    }

    await prisma.deviceType.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
