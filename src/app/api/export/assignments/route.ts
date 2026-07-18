import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");

    const where: Record<string, unknown> = { deletedAt: null };

    if (status === "open") {
      where.returnDate = null;
    } else if (status === "closed") {
      where.returnDate = { not: null };
    }

    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        device: true,
        user: true,
      },
    });

    const headers = [
      "Device",
      "User",
      "Assigned Date",
      "Expected Return",
      "Return Date",
      "Status",
      "Notes",
    ];

    const escapeCSV = (val: string | null | undefined) => {
      const s = val ?? "";
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = assignments.map((a) => [
      escapeCSV(`${a.device.name} (${a.device.assetId})`),
      escapeCSV(`${a.user.firstName} ${a.user.lastName}`),
      escapeCSV(a.assignmentDate.toISOString().split("T")[0]),
      escapeCSV(a.expectedReturnDate?.toISOString().split("T")[0]),
      escapeCSV(a.returnDate?.toISOString().split("T")[0]),
      escapeCSV(a.returnDate ? "Returned" : "Active"),
      escapeCSV(a.notes),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="assignments.csv"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
