import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  handleApiError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@/lib/errors";
import { ReturnAssignmentSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity-log";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("assignments:write");
    const { id } = await params;
    const body = await request.json();
    const parsed = ReturnAssignmentSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ValidationError("Validation failed", details);
    }

    const { returnDate, closedReason, conditionAfter, needsMaintenance, notes } =
      parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findUnique({
        where: { id },
        include: { device: true },
      });

      if (!assignment || assignment.deletedAt) {
        throw new NotFoundError("Assignment", id);
      }

      if (assignment.returnDate) {
        throw new ConflictError("This assignment has already been closed");
      }

      const targetStatusName = needsMaintenance ? "Maintenance" : "Available";
      const targetStatus = await tx.deviceStatus.findFirst({
        where: { name: targetStatusName },
      });

      if (!targetStatus) {
        throw new ConflictError(
          `Device status '${targetStatusName}' not found in system`
        );
      }

      const updated = await tx.assignment.update({
        where: { id },
        data: {
          returnDate,
          closedReason,
          conditionAfter: conditionAfter ?? null,
          returnedById: null,
          notes: notes ?? assignment.notes,
        },
      });

      await tx.device.update({
        where: { id: assignment.deviceId },
        data: { statusId: targetStatus.id },
      });

      return updated;
    });

    await logActivity({
      entityType: "assignment",
      entityId: result.id,
      action: "returned",
      changes: {
        returnDate: { old: null, new: returnDate },
        closedReason: { old: null, new: closedReason },
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
        returnedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(assignment);
  } catch (error) {
    return handleApiError(error);
  }
}
