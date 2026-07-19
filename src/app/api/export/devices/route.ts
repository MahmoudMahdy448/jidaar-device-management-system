import { handleApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") ?? "";
    const statusId = searchParams.get("statusId");
    const deviceTypeId = searchParams.get("deviceTypeId");
    const departmentId = searchParams.get("departmentId");

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { assetId: { contains: search } },
        { serialNumber: { contains: search } },
      ];
    }
    if (statusId) where.statusId = statusId;
    if (deviceTypeId) where.deviceTypeId = deviceTypeId;
    if (departmentId) where.departmentId = departmentId;

    const devices = await prisma.device.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        deviceType: true,
        status: true,
        department: true,
        location: true,
        manufacturer: true,
        assignments: {
          where: { returnDate: null },
          take: 1,
          include: { user: true },
        },
      },
    });

    const headers = [
      "Asset ID",
      "Name",
      "Type",
      "Manufacturer",
      "Model",
      "Serial Number",
      "Status",
      "Assigned To",
      "Department",
      "Location",
      "Purchase Date",
      "Warranty Expiration",
    ];

    const escapeCSV = (val: string | null | undefined) => {
      const s = val ?? "";
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = devices.map((d) => [
      escapeCSV(d.assetId),
      escapeCSV(d.name),
      escapeCSV(d.deviceType.name),
      escapeCSV(d.manufacturer?.name),
      escapeCSV(d.model),
      escapeCSV(d.serialNumber),
      escapeCSV(d.status.name),
      escapeCSV(
        d.assignments[0]?.user
          ? `${d.assignments[0].user.firstName} ${d.assignments[0].user.lastName}`
          : null
      ),
      escapeCSV(d.department?.name),
      escapeCSV(d.location?.name),
      escapeCSV(d.purchaseDate?.toISOString().split("T")[0]),
      escapeCSV(d.warrantyExpiration?.toISOString().split("T")[0]),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="devices.csv"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
