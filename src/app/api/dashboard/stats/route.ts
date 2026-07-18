import { apiSuccess, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");

    const now = new Date();
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    const [
      totalDevices,
      availableDevices,
      assignedDevices,
      maintenanceDevices,
      retiredDevices,
      warrantyExpiringSoon,
    ] = await Promise.all([
      prisma.device.count({ where: { deletedAt: null } }),
      prisma.device.count({
        where: { deletedAt: null, status: { name: "Available" } },
      }),
      prisma.device.count({
        where: { deletedAt: null, status: { name: "Assigned" } },
      }),
      prisma.device.count({
        where: {
          deletedAt: null,
          status: { name: { in: ["Maintenance", "Repair"] } },
        },
      }),
      prisma.device.count({
        where: { deletedAt: null, status: { name: "Retired" } },
      }),
      prisma.device.count({
        where: {
          deletedAt: null,
          warrantyExpiration: { gte: now, lte: in30Days },
        },
      }),
    ]);

    return apiSuccess({
      totalDevices,
      availableDevices,
      assignedDevices,
      maintenanceDevices,
      retiredDevices,
      warrantyExpiringSoon,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
