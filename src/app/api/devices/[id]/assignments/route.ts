import { apiSuccess, handleApiError, NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { id } = await params;

    const device = await prisma.device.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!device || device.deletedAt) {
      throw new NotFoundError("Device", id);
    }

    const assignments = await prisma.assignment.findMany({
      where: { deviceId: id, deletedAt: null },
      orderBy: { assignmentDate: "desc" },
      include: {
        user: true,
        assignedBy: true,
        returnedBy: true,
      },
    });

    return apiSuccess(assignments);
  } catch (error) {
    return handleApiError(error);
  }
}
