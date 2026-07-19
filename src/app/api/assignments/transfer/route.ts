import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@/lib/errors";
import { TransferAssignmentSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity-log";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requirePermission("assignments:write");
    const body = await request.json();
    const parsed = TransferAssignmentSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ValidationError("Validation failed", details);
    }

    const { assignmentId, newUserId, transferDate, notes } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const currentAssignment = await tx.assignment.findUnique({
        where: { id: assignmentId },
      });

      if (!currentAssignment || currentAssignment.deletedAt) {
        throw new NotFoundError("Assignment", assignmentId);
      }

      if (currentAssignment.returnDate) {
        throw new ConflictError("This assignment has already been closed");
      }

      const closed = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          returnDate: transferDate,
          closedReason: "TRANSFERRED",
        },
      });

      const newAssignment = await tx.assignment.create({
        data: {
          deviceId: currentAssignment.deviceId,
          userId: newUserId,
          assignedById: session.user.id,
          assignmentDate: transferDate,
          expectedReturnDate: currentAssignment.expectedReturnDate,
          conditionBefore: currentAssignment.conditionAfter,
          notes: notes ?? null,
        },
      });

      return { closed, newAssignment, previousUserId: currentAssignment.userId };
    });

    await logActivity({
      entityType: "assignment",
      entityId: result.closed.id,
      action: "transferred",
      changes: {
        userId: { old: result.previousUserId, new: newUserId },
        returnDate: { old: null, new: transferDate },
      },
    });

    const newAssignment = await prisma.assignment.findUnique({
      where: { id: result.newAssignment.id },
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

    return apiSuccess(newAssignment);
  } catch (error) {
    return handleApiError(error);
  }
}
