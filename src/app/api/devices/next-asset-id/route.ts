import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lastDevice = await prisma.device.findFirst({
      where: { deletedAt: null },
      orderBy: { assetId: "desc" },
      select: { assetId: true },
    });

    let nextNumber = 1;
    if (lastDevice?.assetId) {
      const match = lastDevice.assetId.match(/AST-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const nextAssetId = `AST-${String(nextNumber).padStart(4, "0")}`;
    return apiSuccess({ assetId: nextAssetId });
  } catch (error) {
    return handleApiError(error);
  }
}
