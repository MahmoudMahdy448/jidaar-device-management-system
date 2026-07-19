import { apiSuccess, handleApiError, NotFoundError, ConflictError } from "@/lib/errors";
import { ManufacturerSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
      include: { _count: { select: { devices: true } } },
    });

    if (!manufacturer) {
      throw new NotFoundError("Manufacturer", id);
    }

    return apiSuccess(manufacturer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("manufacturers:write");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const body = await request.json();
    const parsed = ManufacturerSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.manufacturer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Manufacturer", id);
    }

    const duplicate = await prisma.manufacturer.findFirst({
      where: {
        id: { not: id },
        name: parsed.data.name,
      },
    });

    if (duplicate) {
      throw new ConflictError("A manufacturer with this name already exists");
    }

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(manufacturer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("manufacturers:delete");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const existing = await prisma.manufacturer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Manufacturer", id);
    }

    const deviceCount = await prisma.device.count({
      where: { manufacturerId: id },
    });

    if (deviceCount > 0) {
      throw new ConflictError(
        `Cannot delete: this manufacturer is referenced by ${deviceCount} ${deviceCount === 1 ? "record" : "records"}`,
        { referenceCount: String(deviceCount) }
      );
    }

    await prisma.manufacturer.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
