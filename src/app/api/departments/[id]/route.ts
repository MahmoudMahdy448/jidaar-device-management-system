import { apiSuccess, handleApiError, NotFoundError, ConflictError } from "@/lib/errors";
import { DepartmentSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { devices: true, users: true } } },
    });

    if (!department) {
      throw new NotFoundError("Department", id);
    }

    return apiSuccess(department);
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
    const parsed = DepartmentSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Department", id);
    }

    const duplicate = await prisma.department.findFirst({
      where: {
        id: { not: id },
        OR: [
          { name: parsed.data.name },
          ...(parsed.data.code ? [{ code: parsed.data.code }] : []),
        ],
      },
    });

    if (duplicate) {
      const field = duplicate.name === parsed.data.name ? "name" : "code";
      throw new ConflictError(`A department with this ${field} already exists`);
    }

    const department = await prisma.department.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess(department);
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
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Department", id);
    }

    const deviceCount = await prisma.device.count({ where: { departmentId: id } });
    const userCount = await prisma.user.count({ where: { departmentId: id } });
    const totalReferences = deviceCount + userCount;

    if (totalReferences > 0) {
      throw new ConflictError(
        `Cannot delete: this department is referenced by ${totalReferences} ${totalReferences === 1 ? "record" : "records"}`,
        { referenceCount: String(totalReferences) }
      );
    }

    await prisma.department.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
