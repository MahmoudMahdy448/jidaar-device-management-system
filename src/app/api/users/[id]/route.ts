import { z } from "zod";
import { apiSuccess, handleApiError, NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { logActivity, computeChanges } from "@/lib/activity-log";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const UpdateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100).optional(),
  email: z.string().email("Invalid email format").max(255).optional(),
  phone: z.string().max(20).optional().nullable(),
  employeeId: z.string().min(1, "Employee ID is required").max(50).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  officeLocation: z.string().max(100).optional().nullable(),
  role: z.enum(["ADMIN", "TECHNICIAN", "READ_ONLY"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).optional(),
  notes: z.string().optional().nullable(),
});

const TRACKED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "employeeId",
  "departmentId",
  "jobTitle",
  "officeLocation",
  "role",
  "status",
];

async function getUser(id: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.user.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      myAssignments: {
        where: { returnDate: null },
        select: { id: true },
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser(id);

    if (!user) {
      throw new NotFoundError("User", id);
    }

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission("users:write");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ValidationError("Validation failed", details);
    }

    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing || existing.deletedAt) {
      throw new NotFoundError("User", id);
    }

    const data = parsed.data;

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) {
        throw new ConflictError("A user with this email already exists");
      }
    }

    if (data.employeeId && data.employeeId !== existing.employeeId) {
      const empTaken = await prisma.user.findUnique({ where: { employeeId: data.employeeId } });
      if (empTaken) {
        throw new ConflictError("A user with this employee ID already exists");
      }
    }

    const newStatus = data.status ?? existing.status;
    const isDeactivating =
      (newStatus === "TERMINATED" || newStatus === "INACTIVE") &&
      existing.status === "ACTIVE";

    if (isDeactivating) {
      const openAssignments = await prisma.assignment.count({
        where: { userId: id, returnDate: null, deletedAt: null },
      });

      if (openAssignments > 0) {
        throw new ConflictError(
          `Cannot deactivate user with ${openAssignments} open assignment(s). Return or reassign devices first.`,
          { openAssignments: String(openAssignments) }
        );
      }
    }

    const changes = computeChanges(
      existing as unknown as Record<string, unknown>,
      data as Record<string, unknown>,
      TRACKED_FIELDS
    );

    const updated = await prisma.user.update({
      where: { id },
      data,
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
        notes: true,
        createdAt: true,
        updatedAt: true,
        department: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      entityType: "user",
      entityId: id,
      action: changes ? "updated" : "status_changed",
      changes,
      actorId: session.user.id,
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission("users:delete");
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        myAssignments: {
          where: { returnDate: null, deletedAt: null },
          select: { id: true },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundError("User", id);
    }

    if (user.myAssignments.length > 0) {
      throw new ConflictError(
        `Cannot delete user with ${user.myAssignments.length} open assignment(s). Return or reassign devices first.`,
        { openAssignments: String(user.myAssignments.length) }
      );
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logActivity({
      entityType: "user",
      entityId: id,
      action: "deleted",
      actorId: session.user.id,
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
