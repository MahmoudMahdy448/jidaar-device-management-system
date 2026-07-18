import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "All fields are required" } },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return Response.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "New passwords do not match" } },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return Response.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters" } },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/prisma");
    const bcrypt = await import("bcryptjs");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return Response.json(
        { data: null, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return Response.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "Current password is incorrect" } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return Response.json({ data: { message: "Password updated successfully" } });
  } catch (error) {
    return handleApiError(error);
  }
}
