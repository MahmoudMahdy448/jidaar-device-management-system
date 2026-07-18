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

interface AssignmentFilters {
  page?: number;
  pageSize?: number;
  status?: "open" | "closed";
  userId?: string;
  deviceId?: string;
  overdue?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

function buildQueryString(filters: AssignmentFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAssignments(filters: AssignmentFilters = {}) {
  const queryString = buildQueryString(filters);
  const { data, isLoading, error, mutate } = useSWR(
    `/api/assignments${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    assignments: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useAssignment(id: string | null) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? `/api/assignments/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    assignment: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useOverdueAssignments() {
  const { data, isLoading, error, mutate } = useSWR(
    "/api/assignments/overdue",
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    assignments: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}
