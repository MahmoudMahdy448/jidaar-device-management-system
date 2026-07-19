import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError, ConflictError, ValidationError } from "@/lib/errors";
import { CreateUserSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity-log";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
    const search = searchParams.get("search") ?? "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const allowedSortFields: Record<string, string> = {
      firstName: "firstName",
      lastName: "lastName",
      email: "email",
      employeeId: "employeeId",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    };
    const orderBy = { [allowedSortFields[sortBy] ?? "createdAt"]: sortOrder };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          departmentId: true,
          jobTitle: true,
          officeLocation: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          department: { select: { id: true, name: true } },
        },
      }),
    ]);

    return apiSuccess(users, { page, pageSize, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("users:write");
    const { hash } = await import("bcryptjs");
    const body = await request.json();
    const parsed = CreateUserSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ValidationError("Validation failed", details);
    }

    const { password, ...userData } = parsed.data;

    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { employeeId: userData.employeeId },
          ],
        },
      });

      if (existing) {
        const field = existing.email === userData.email ? "email" : "employeeId";
        throw new ConflictError(`A user with this ${field} already exists`);
      }

      const passwordHash = await hash(password, 12);

      return tx.user.create({
        data: {
          ...userData,
          passwordHash,
        },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          departmentId: true,
          jobTitle: true,
          officeLocation: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
    });

    await logActivity({
      entityType: "user",
      entityId: user.id,
      action: "created",
      actorId: session.user.id,
    });

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
