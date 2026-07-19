import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError, ValidationError, NotFoundError } from "@/lib/errors";
import { requirePermission } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "application/pdf": "application/pdf",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("assignments:read");
    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!assignment) {
      throw new NotFoundError("Assignment", id);
    }

    const attachments = await prisma.attachment.findMany({
      where: { assignmentId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        attachmentType: true,
        createdAt: true,
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess(
      attachments.map((a) => ({ ...a, size: a.size?.toString() ?? null }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission("assignments:write");
    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!assignment) {
      throw new NotFoundError("Assignment", id);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      throw new ValidationError("Expected multipart/form-data", {
        content_type: "Must be multipart/form-data",
      });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new ValidationError("No file provided", {
        file: "A file is required",
      });
    }

    const mimeType = file.type;
    if (!ALLOWED_TYPES[mimeType]) {
      throw new ValidationError(
        `Invalid file type: ${mimeType}. Allowed: PDF, JPEG, PNG.`,
        { fileType: "Must be PDF, JPEG, or PNG" }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 10MB.`,
        { fileSize: "Maximum file size is 10MB" }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const attachment = await prisma.attachment.create({
      data: {
        assignmentId: id,
        attachmentType: "SIGNED_ASSIGNMENT_FORM",
        filename: file.name,
        mimeType,
        size: BigInt(file.size),
        content: buffer,
        s3Key: null,
        uploadedById: session.user.id,
      },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        attachmentType: true,
        createdAt: true,
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await logActivity({
      entityType: "assignment",
      entityId: id,
      action: "updated",
      actorId: session.user.id,
      changes: {
        attachment_uploaded: {
          old: null,
          new: { attachmentId: attachment.id, filename: file.name },
        },
      },
    });

    return apiSuccess({ ...attachment, size: attachment.size?.toString() ?? null });
  } catch (error) {
    return handleApiError(error);
  }
}
