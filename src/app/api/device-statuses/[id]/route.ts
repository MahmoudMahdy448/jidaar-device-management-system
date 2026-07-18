import { apiSuccess, handleApiError, NotFoundError, ConflictError } from "@/lib/errors";
import { DeviceStatusSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const deviceStatus = await prisma.deviceStatus.findUnique({
      where: { id },
      include: { _count: { select: { devices: true } } },
    });

    if (!deviceStatus) {
      throw new NotFoundError("Device status", id);
    }

    return apiSuccess(deviceStatus);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const body = await request.json();
    const parsed = DeviceStatusSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.deviceStatus.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Device status", id);
    }

    const duplicate = await prisma.deviceStatus.findFirst({
      where: {
        id: { not: id },
        name: parsed.data.name,
      },
    });

    if (duplicate) {
      throw new ConflictError("A device status with this name already exists");
    }

    const deviceStatus = await prisma.deviceStatus.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(deviceStatus);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const existing = await prisma.deviceStatus.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Device status", id);
    }

    const deviceCount = await prisma.device.count({
      where: { statusId: id },
    });

    if (deviceCount > 0) {
      throw new ConflictError(
        `Cannot delete: this device status is referenced by ${deviceCount} ${deviceCount === 1 ? "record" : "records"}`,
        { referenceCount: String(deviceCount) }
      );
    }

    await prisma.deviceStatus.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
