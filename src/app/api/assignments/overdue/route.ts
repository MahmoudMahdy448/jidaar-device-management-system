import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10))
    );

    const where = {
      deletedAt: null,
      returnDate: null,
      expectedReturnDate: { lt: new Date() },
    };

    const [total, assignments] = await Promise.all([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { expectedReturnDate: "asc" },
        include: {
          device: {
            select: {
              id: true,
              name: true,
              assetId: true,
              status: { select: { id: true, name: true, color: true } },
            },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return apiSuccess(assignments, { page, pageSize, total });
  } catch (error) {
    return handleApiError(error);
  }
}
