import { apiSuccess, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");

    const [devicesByType, devicesByStatus] = await Promise.all([
      prisma.device.groupBy({
        by: ["deviceTypeId"],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      prisma.device.groupBy({
        by: ["statusId"],
        where: { deletedAt: null },
        _count: { id: true },
      }),
    ]);

    const typeIds = devicesByType.map((g) => g.deviceTypeId);
    const statusIds = devicesByStatus.map((g) => g.statusId);

    const [types, statuses] = await Promise.all([
      prisma.deviceType.findMany({ where: { id: { in: typeIds } } }),
      prisma.deviceStatus.findMany({ where: { id: { in: statusIds } } }),
    ]);

    const typeMap = new Map(types.map((t) => [t.id, t.name]));
    const statusMap = new Map(
      statuses.map((s) => [s.id, { name: s.name, color: s.color }])
    );

    const resultByType = devicesByType.map((g) => ({
      type: typeMap.get(g.deviceTypeId) ?? "Unknown",
      count: g._count.id,
    }));

    const resultByStatus = devicesByStatus.map((g) => {
      const info = statusMap.get(g.statusId);
      return {
        status: info?.name ?? "Unknown",
        count: g._count.id,
        color: info?.color ?? "#888888",
      };
    });

    return apiSuccess({ devicesByType: resultByType, devicesByStatus: resultByStatus });
  } catch (error) {
    return handleApiError(error);
  }
}
