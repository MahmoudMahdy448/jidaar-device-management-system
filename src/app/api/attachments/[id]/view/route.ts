import { prisma } from "@/lib/prisma";
import { handleApiError, NotFoundError } from "@/lib/errors";
import { requirePermission } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("assignments:read");
    const { id } = await params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        filename: true,
        mimeType: true,
      },
    });

    if (!attachment) {
      throw new NotFoundError("Attachment", id);
    }

    const buffer = Buffer.from(attachment.content);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.filename)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
