import { apiSuccess, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";

    if (!q.trim()) {
      return apiSuccess({ devices: [], users: [] });
    }

    const term = q.trim();

    const [devices, users] = await Promise.all([
      prisma.device.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: term } },
            { assetId: { contains: term } },
            { serialNumber: { contains: term } },
            { ipAddress: { contains: term } },
            { macAddress: { contains: term } },
            { model: { contains: term } },
            { hostname: { contains: term } },
            { manufacturer: { name: { contains: term } } },
            { deviceType: { name: { contains: term } } },
            { department: { name: { contains: term } } },
            { location: { name: { contains: term } } },
            { vendor: { name: { contains: term } } },
          ],
        },
        take: 8,
        include: {
          status: true,
          deviceType: true,
          manufacturer: { select: { name: true } },
          department: { select: { name: true } },
          location: { select: { name: true, building: true, room: true } },
        },
      }),
      prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            { firstName: { contains: term } },
            { lastName: { contains: term } },
            { email: { contains: term } },
            { employeeId: { contains: term } },
            { department: { name: { contains: term } } },
          ],
        },
        take: 8,
        include: { department: { select: { name: true } } },
      }),
    ]);

    return apiSuccess({ devices, users });
  } catch (error) {
    return handleApiError(error);
  }
}
