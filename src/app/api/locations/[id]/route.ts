import { apiSuccess, handleApiError, NotFoundError, ConflictError } from "@/lib/errors";
import { LocationSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const location = await prisma.location.findUnique({
      where: { id },
      include: { _count: { select: { devices: true } } },
    });

    if (!location) {
      throw new NotFoundError("Location", id);
    }

    return apiSuccess(location);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("locations:write");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const body = await request.json();
    const parsed = LocationSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Location", id);
    }

    const duplicate = await prisma.location.findFirst({
      where: {
        id: { not: id },
        name: parsed.data.name,
        building: parsed.data.building ?? null,
        floor: parsed.data.floor ?? null,
        room: parsed.data.room ?? null,
      },
    });

    if (duplicate) {
      throw new ConflictError("A location with these details already exists");
    }

    const location = await prisma.location.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(location);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("locations:delete");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Location", id);
    }

    const deviceCount = await prisma.device.count({ where: { locationId: id } });

    if (deviceCount > 0) {
      throw new ConflictError(
        `Cannot delete: this location is referenced by ${deviceCount} ${deviceCount === 1 ? "record" : "records"}`,
        { referenceCount: String(deviceCount) }
      );
    }

    await prisma.location.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
