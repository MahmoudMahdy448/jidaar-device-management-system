import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
  ValidationError,
  ConflictError,
} from "@/lib/errors";
import { AssignmentSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity-log";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10))
    );
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const deviceId = searchParams.get("deviceId");
    const overdue = searchParams.get("overdue");
    const search = searchParams.get("search");
    const departmentId = searchParams.get("departmentId");
    const deviceTypeId = searchParams.get("deviceTypeId");
    const sortBy = searchParams.get("sortBy") ?? "assignmentDate";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const andConditions: Record<string, unknown>[] = [{ deletedAt: null }];

    if (status === "open") {
      andConditions.push({ returnDate: null });
    } else if (status === "closed") {
      andConditions.push({ returnDate: { not: null } });
    }

    if (userId) andConditions.push({ userId });
    if (deviceId) andConditions.push({ deviceId });

    if (overdue === "true") {
      andConditions.push({ returnDate: null });
      andConditions.push({ expectedReturnDate: { lt: new Date() } });
    }

    const deviceFilter: Record<string, unknown> = {};
    if (departmentId) deviceFilter.departmentId = departmentId;
    if (deviceTypeId) deviceFilter.deviceTypeId = deviceTypeId;
    if (Object.keys(deviceFilter).length > 0) {
      andConditions.push({ device: deviceFilter });
    }

    if (search) {
      andConditions.push({
        OR: [
          { device: { name: { contains: search } } },
          { device: { assetId: { contains: search } } },
          { user: { firstName: { contains: search } } },
          { user: { lastName: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      });
    }

    const where = { AND: andConditions };

    const allowedSortFields: Record<string, string> = {
      assignmentDate: "assignmentDate",
      expectedReturnDate: "expectedReturnDate",
      returnDate: "returnDate",
      createdAt: "createdAt",
    };
    const orderBy = {
      [allowedSortFields[sortBy] ?? "assignmentDate"]: sortOrder,
    };

    const [total, assignments] = await Promise.all([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          device: {
            select: {
              id: true,
              name: true,
              assetId: true,
              status: { select: { id: true, name: true, color: true } },
            },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          returnedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return apiSuccess(assignments, { page, pageSize, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("assignments:write");
    const body = await request.json();
    const parsed = AssignmentSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ValidationError("Validation failed", details);
    }

    const { deviceId, userId, assignmentDate, expectedReturnDate, conditionBefore, notes } =
      parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const device = await tx.$queryRawUnsafe<{ id: string; statusId: string }[]>(
        'SELECT "id", "status_id" AS "statusId" FROM "devices" WHERE "id" = $1 AND "deleted_at" IS NULL FOR UPDATE',
        deviceId
      );

      if (!device || device.length === 0) {
        throw new ConflictError("Device not found");
      }

      const user = await tx.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { id: true, status: true },
      });

      if (!user) {
        throw new ConflictError("User not found");
      }

      if (user.status === "TERMINATED") {
        throw new ConflictError("Cannot assign device to a terminated user");
      }

      const openAssignment = await tx.assignment.findFirst({
        where: {
          deviceId,
          returnDate: null,
          deletedAt: null,
        },
      });

      if (openAssignment) {
        throw new ConflictError(
          "This device already has an active assignment. Return or transfer it before assigning to a new user.",
          { existingAssignmentId: openAssignment.id }
        );
      }

      const assignedStatus = await tx.deviceStatus.findFirst({
        where: { name: "Assigned" },
      });

      if (!assignedStatus) {
        throw new ConflictError("Device status 'Assigned' not found in system");
      }

      const assignment = await tx.assignment.create({
        data: {
          deviceId,
          userId,
          assignedById: parsed.data.assignedById ?? null,
          assignmentDate,
          expectedReturnDate: expectedReturnDate ?? null,
          conditionBefore: conditionBefore ?? null,
          notes: notes ?? null,
        },
      });

      await tx.device.update({
        where: { id: deviceId },
        data: { statusId: assignedStatus.id },
      });

      return assignment;
    });

    await logActivity({
      entityType: "assignment",
      entityId: result.id,
      action: "assigned",
      changes: {
        deviceId: { old: null, new: deviceId },
        userId: { old: null, new: userId },
      },
    });

    const assignment = await prisma.assignment.findUnique({
      where: { id: result.id },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            assetId: true,
            status: { select: { id: true, name: true, color: true } },
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(assignment);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return handleApiError(
        new ConflictError(
          "This device already has an active assignment. Return or transfer it before assigning to a new user."
        )
      );
    }
    return handleApiError(error);
  }
}
