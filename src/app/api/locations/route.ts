import { apiSuccess, handleApiError, ConflictError } from "@/lib/errors";
import { LocationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { devices: true } } },
    });
    return apiSuccess(locations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const parsed = LocationSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.location.findFirst({
      where: {
        name: parsed.data.name,
        building: parsed.data.building ?? null,
        floor: parsed.data.floor ?? null,
        room: parsed.data.room ?? null,
      },
    });

    if (existing) {
      throw new ConflictError("A location with these details already exists");
    }

    const location = await prisma.location.create({
      data: parsed.data,
    });

    return apiSuccess(location);
  } catch (error) {
    return handleApiError(error);
  }
}
