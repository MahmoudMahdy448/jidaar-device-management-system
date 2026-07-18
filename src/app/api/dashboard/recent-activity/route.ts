import { apiSuccess, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");

    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        actor: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const enriched = await Promise.all(
      logs.map(async (log) => {
        let entityName = log.entityId;

        if (log.entityType === "device") {
          const device = await prisma.device.findUnique({
            where: { id: log.entityId },
            select: { name: true, assetId: true },
          });
          entityName = device ? `${device.name} (${device.assetId})` : log.entityId;
        } else if (log.entityType === "user") {
          const user = await prisma.user.findUnique({
            where: { id: log.entityId },
            select: { firstName: true, lastName: true },
          });
          entityName = user ? `${user.firstName} ${user.lastName}` : log.entityId;
        } else if (log.entityType === "assignment") {
          const assignment = await prisma.assignment.findUnique({
            where: { id: log.entityId },
            select: { id: true },
          });
          entityName = assignment ? `Assignment ${log.entityId.slice(0, 8)}` : log.entityId;
        }

        return {
          id: log.id,
          entityType: log.entityType,
          entityId: log.entityId,
          action: log.action,
          entityName,
          actor: log.actor
            ? `${log.actor.firstName} ${log.actor.lastName}`
            : "System",
          timestamp: log.createdAt,
        };
      })
    );

    return apiSuccess(enriched);
  } catch (error) {
    return handleApiError(error);
  }
}
