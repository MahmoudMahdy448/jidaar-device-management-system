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

interface UserFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  departmentId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

function buildQueryString(filters: UserFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useUsers(filters: UserFilters = {}) {
  const queryString = buildQueryString(filters);
  const { data, isLoading, error, mutate } = useSWR(
    `/api/users${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    users: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useUser(id: string | null) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? `/api/users/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    user: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useUserAssignments(id: string | null) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? `/api/users/${id}/assignments` : null,
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
