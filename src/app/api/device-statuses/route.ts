import { apiSuccess, handleApiError, ConflictError } from "@/lib/errors";
import { DeviceStatusSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const deviceStatuses = await prisma.deviceStatus.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { devices: true } } },
    });
    return apiSuccess(deviceStatuses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const parsed = DeviceStatusSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.deviceStatus.findFirst({
      where: { name: parsed.data.name },
    });

    if (existing) {
      throw new ConflictError("A device status with this name already exists");
    }

    const deviceStatus = await prisma.deviceStatus.create({
      data: parsed.data,
    });

    return apiSuccess(deviceStatus);
  } catch (error) {
    return handleApiError(error);
  }
}
