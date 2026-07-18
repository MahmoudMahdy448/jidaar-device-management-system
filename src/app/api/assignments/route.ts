import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
  ValidationError,
  ConflictError,
} from "@/lib/errors";
import { AssignmentSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity-log";

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
    const sortBy = searchParams.get("sortBy") ?? "assignmentDate";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = { deletedAt: null };

    if (status === "open") {
      where.returnDate = null;
    } else if (status === "closed") {
      where.returnDate = { not: null };
    }

    if (userId) where.userId = userId;
    if (deviceId) where.deviceId = deviceId;

    if (overdue === "true") {
      where.returnDate = null;
      where.expectedReturnDate = { lt: new Date() };
    }

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
      const device = await tx.device.findUnique({
        where: { id: deviceId },
        include: { status: true },
      });

      if (!device || device.deletedAt) {
        throw new ConflictError("Device not found");
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
    return handleApiError(error);
  }
}
