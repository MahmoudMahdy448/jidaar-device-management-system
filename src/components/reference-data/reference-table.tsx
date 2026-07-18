"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { ReferenceResource } from "@/hooks/use-reference-data";

interface ReferenceItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface ReferenceTableProps {
  resource: ReferenceResource;
  data: ReferenceItem[];
  onEdit: (item: ReferenceItem) => void;
  onDelete: (item: ReferenceItem) => void;
}

function renderDetails(resource: ReferenceResource, item: ReferenceItem) {
  switch (resource) {
    case "departments":
      return item.code ? <Badge variant="secondary">{item.code as string}</Badge> : <span className="text-muted-foreground">—</span>;
    case "locations": {
      const parts = [item.building, item.floor, item.room].filter(Boolean);
      return parts.length > 0 ? (
        <span className="text-sm text-muted-foreground">{parts.join(", ")}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    }
    case "manufacturers":
      return item.website ? (
        <a
          href={item.website as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          {(item.website as string).replace(/^https?:\/\//, "")}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    case "vendors": {
      const details = [
        item.contactName,
        item.email,
        item.phone,
      ].filter(Boolean);
      return details.length > 0 ? (
        <span className="text-sm text-muted-foreground">{details.join(", ")}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    }
    case "device-types":
      return item.category ? (
        <Badge variant="secondary">{item.category as string}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    case "device-statuses":
      return (
        <div className="flex items-center gap-2">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: item.color as string }}
          />
          <span className="text-muted-foreground">{item.sortOrder as number}</span>
        </div>
      );
    default:
      return null;
  }
}

export function ReferenceTable({
  resource,
  data,
  onEdit,
  onDelete,
}: ReferenceTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-sm text-muted-foreground">No records found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{renderDetails(resource, item)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
