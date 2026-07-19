import { apiSuccess, handleApiError, ConflictError } from "@/lib/errors";
import { DeviceTypeSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const deviceTypes = await prisma.deviceType.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { devices: true } } },
    });
    return apiSuccess(deviceTypes);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("device-types:write");
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const parsed = DeviceTypeSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.deviceType.findFirst({
      where: { name: parsed.data.name },
    });

    if (existing) {
      throw new ConflictError("A device type with this name already exists");
    }

    const deviceType = await prisma.deviceType.create({
      data: parsed.data,
    });

    return apiSuccess(deviceType);
  } catch (error) {
    return handleApiError(error);
  }
}
