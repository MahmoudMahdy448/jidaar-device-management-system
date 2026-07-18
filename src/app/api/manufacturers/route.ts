import { apiSuccess, handleApiError, ConflictError } from "@/lib/errors";
import { ManufacturerSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { devices: true } } },
    });
    return apiSuccess(manufacturers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const parsed = ManufacturerSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.manufacturer.findFirst({
      where: { name: parsed.data.name },
    });

    if (existing) {
      throw new ConflictError("A manufacturer with this name already exists");
    }

    const manufacturer = await prisma.manufacturer.create({
      data: parsed.data,
    });

    return apiSuccess(manufacturer);
  } catch (error) {
    return handleApiError(error);
  }
}
