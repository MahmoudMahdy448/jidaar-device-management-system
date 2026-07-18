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

    const activityLogs = await prisma.activityLog.findMany({
      where: { entityType: "device", entityId: id },
      orderBy: { createdAt: "desc" },
      include: { actor: true },
    });

    return apiSuccess(activityLogs);
  } catch (error) {
    return handleApiError(error);
  }
}
