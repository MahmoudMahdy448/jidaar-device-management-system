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
            { name: { contains: term, mode: "insensitive" } },
            { assetId: { contains: term, mode: "insensitive" } },
            { serialNumber: { contains: term, mode: "insensitive" } },
            { ipAddress: { contains: term, mode: "insensitive" } },
            { macAddress: { contains: term, mode: "insensitive" } },
            { model: { contains: term, mode: "insensitive" } },
            { hostname: { contains: term, mode: "insensitive" } },
            { manufacturer: { name: { contains: term, mode: "insensitive" } } },
            { deviceType: { name: { contains: term, mode: "insensitive" } } },
            { department: { name: { contains: term, mode: "insensitive" } } },
            { location: { name: { contains: term, mode: "insensitive" } } },
            { vendor: { name: { contains: term, mode: "insensitive" } } },
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
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { employeeId: { contains: term, mode: "insensitive" } },
            { department: { name: { contains: term, mode: "insensitive" } } },
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
