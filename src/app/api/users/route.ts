import { z } from "zod";
import { apiSuccess, handleApiError, ConflictError, ValidationError } from "@/lib/errors";
import { logActivity } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

const CreateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().min(1, "Email is required").max(255).email("Invalid email format"),
  phone: z.string().max(20).optional().nullable(),
  employeeId: z.string().min(1, "Employee ID is required").max(50),
  departmentId: z.string().uuid().optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  officeLocation: z.string().max(100).optional().nullable(),
  role: z.enum(["ADMIN", "TECHNICIAN", "READ_ONLY"]).default("READ_ONLY"),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).default("ACTIVE"),
  notes: z.string().optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function GET(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
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
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
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
    const { prisma } = await import("@/lib/prisma");
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

    const existing = await prisma.user.findFirst({
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

    const user = await prisma.user.create({
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

    await logActivity({
      entityType: "user",
      entityId: user.id,
      action: "created",
    });

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
