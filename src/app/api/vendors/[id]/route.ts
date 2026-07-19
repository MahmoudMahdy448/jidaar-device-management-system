import { apiSuccess, handleApiError, NotFoundError, ConflictError } from "@/lib/errors";
import { VendorSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { _count: { select: { devices: true } } },
    });

    if (!vendor) {
      throw new NotFoundError("Vendor", id);
    }

    return apiSuccess(vendor);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("vendors:write");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const body = await request.json();
    const parsed = VendorSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.vendor.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Vendor", id);
    }

    const duplicate = await prisma.vendor.findFirst({
      where: {
        id: { not: id },
        name: parsed.data.name,
      },
    });

    if (duplicate) {
      throw new ConflictError("A vendor with this name already exists");
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(vendor);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("vendors:delete");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const existing = await prisma.vendor.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Vendor", id);
    }

    const deviceCount = await prisma.device.count({
      where: { vendorId: id },
    });

    if (deviceCount > 0) {
      throw new ConflictError(
        `Cannot delete: this vendor is referenced by ${deviceCount} ${deviceCount === 1 ? "record" : "records"}`,
        { referenceCount: String(deviceCount) }
      );
    }

    await prisma.vendor.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
