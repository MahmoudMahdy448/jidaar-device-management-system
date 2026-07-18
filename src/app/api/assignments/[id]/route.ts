import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError, NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            assetId: true,
            model: true,
            serialNumber: true,
            status: { select: { id: true, name: true, color: true } },
            deviceType: { select: { name: true } },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } },
          },
        },
        assignedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        returnedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!assignment || assignment.deletedAt) {
      throw new NotFoundError("Assignment", id);
    }

    return apiSuccess(assignment);
  } catch (error) {
    return handleApiError(error);
  }
}
