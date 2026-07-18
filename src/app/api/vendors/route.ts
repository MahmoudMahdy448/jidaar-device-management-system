import { apiSuccess, handleApiError, ConflictError } from "@/lib/errors";
import { VendorSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const vendors = await prisma.vendor.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { devices: true } } },
    });
    return apiSuccess(vendors);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const parsed = VendorSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        details[field] = issue.message;
      });
      throw new ConflictError("Validation failed", details);
    }

    const existing = await prisma.vendor.findFirst({
      where: { name: parsed.data.name },
    });

    if (existing) {
      throw new ConflictError("A vendor with this name already exists");
    }

    const vendor = await prisma.vendor.create({
      data: parsed.data,
    });

    return apiSuccess(vendor);
  } catch (error) {
    return handleApiError(error);
  }
}
