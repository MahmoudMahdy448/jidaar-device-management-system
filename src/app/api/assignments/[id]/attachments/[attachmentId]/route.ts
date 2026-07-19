import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError, NotFoundError } from "@/lib/errors";
import { requirePermission } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const session = await requirePermission("assignments:write");
    const { id, attachmentId } = await params;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      select: { id: true, assignmentId: true, filename: true },
    });

    if (!attachment || attachment.assignmentId !== id) {
      throw new NotFoundError("Attachment", attachmentId);
    }

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    await logActivity({
      entityType: "assignment",
      entityId: id,
      action: "updated",
      actorId: session.user.id,
      changes: {
        attachment_deleted: {
          old: { attachmentId: attachment.id, filename: attachment.filename },
          new: null,
        },
      },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
