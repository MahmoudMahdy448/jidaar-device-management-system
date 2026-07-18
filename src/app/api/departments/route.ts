import { apiSuccess, handleApiError, ConflictError } from "@/lib/errors";
import { DepartmentSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { devices: true, users: true } } },
    });
    return apiSuccess(departments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
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

    const existing = await prisma.department.findFirst({
      where: {
        OR: [
          { name: parsed.data.name },
          ...(parsed.data.code ? [{ code: parsed.data.code }] : []),
        ],
      },
    });

    if (existing) {
      const field = existing.name === parsed.data.name ? "name" : "code";
      throw new ConflictError(`A department with this ${field} already exists`);
    }

    const department = await prisma.department.create({
      data: parsed.data,
    });

    return apiSuccess(department);
  } catch (error) {
    return handleApiError(error);
  }
}
