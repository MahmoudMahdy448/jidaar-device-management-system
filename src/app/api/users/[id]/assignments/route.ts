import { apiSuccess, handleApiError, NotFoundError } from "@/lib/errors";
import { requirePermission } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("users:read");
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError("User", id);
    }

    const assignments = await prisma.assignment.findMany({
      where: { userId: id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            assetId: true,
            serialNumber: true,
            status: { select: { id: true, name: true, color: true } },
          },
        },
        assignedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        returnedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: { select: { attachments: true } },
      },
    });

    return apiSuccess(assignments);
  } catch (error) {
    return handleApiError(error);
  }
}
