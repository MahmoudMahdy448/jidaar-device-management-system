import { auth } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ data: null, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        departmentId: true,
        jobTitle: true,
        officeLocation: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ data: null, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
    }

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
