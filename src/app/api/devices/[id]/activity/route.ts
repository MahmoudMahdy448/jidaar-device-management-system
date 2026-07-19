import { apiSuccess, handleApiError, NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;

    const device = await prisma.device.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!device || device.deletedAt) {
      throw new NotFoundError("Device", id);
    }

    const assignmentIds = (
      await prisma.assignment.findMany({
        where: { deviceId: id },
        select: { id: true },
      })
    ).map((a) => a.id);

    const activityLogs = await prisma.activityLog.findMany({
      where: {
        OR: [
          { entityType: "device", entityId: id },
          { entityType: "assignment", entityId: { in: assignmentIds } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { actor: true },
    });

    return apiSuccess(activityLogs);
  } catch (error) {
    return handleApiError(error);
  }
}
