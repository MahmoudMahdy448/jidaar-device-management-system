"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || "Failed to fetch");
  }
  return json;
};

interface DeviceFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  statusId?: string;
  deviceTypeId?: string;
  departmentId?: string;
  manufacturerId?: string;
  locationId?: string;
  vendorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

function buildQueryString(filters: DeviceFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useDevices(filters: DeviceFilters = {}) {
  const queryString = buildQueryString(filters);
  const { data, isLoading, error, mutate } = useSWR(
    `/api/devices${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    devices: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useDevice(id: string | null) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? `/api/devices/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    device: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useDeviceAssignments(id: string | null) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? `/api/devices/${id}/assignments` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    assignments: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useDeviceActivity(id: string | null) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? `/api/devices/${id}/activity` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    activityLogs: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}
