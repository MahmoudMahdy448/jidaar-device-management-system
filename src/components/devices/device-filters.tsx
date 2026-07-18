"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useReferenceData } from "@/hooks/use-reference-data";

interface DeviceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusId: string;
  onStatusChange: (value: string) => void;
  deviceTypeId: string;
  onDeviceTypeChange: (value: string) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
}

export function DeviceFilters({
  search,
  onSearchChange,
  statusId,
  onStatusChange,
  deviceTypeId,
  onDeviceTypeChange,
  departmentId,
  onDepartmentChange,
}: DeviceFiltersProps) {
  const { data: deviceStatuses } = useReferenceData<{ id: string; name: string }>("device-statuses");
  const { data: deviceTypes } = useReferenceData<{ id: string; name: string }>("device-types");
  const { data: departments } = useReferenceData<{ id: string; name: string }>("departments");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, asset ID, serial number, IP..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex gap-2">
        <Select value={statusId} onValueChange={(v) => onStatusChange(v ?? "")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {deviceStatuses.map((s: { id: string; name: string }) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={deviceTypeId} onValueChange={(v) => onDeviceTypeChange(v ?? "")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {deviceTypes.map((t: { id: string; name: string }) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={departmentId} onValueChange={(v) => onDepartmentChange(v ?? "")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d: { id: string; name: string }) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
