"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || "Failed to fetch");
  }
  return json.data;
};

export type ReferenceResource =
  | "departments"
  | "locations"
  | "manufacturers"
  | "vendors"
  | "device-types"
  | "device-statuses";

const RESOURCE_PATHS: Record<ReferenceResource, string> = {
  departments: "/api/departments",
  locations: "/api/locations",
  manufacturers: "/api/manufacturers",
  vendors: "/api/vendors",
  "device-types": "/api/device-types",
  "device-statuses": "/api/device-statuses",
};

export function useReferenceData<T>(resource: ReferenceResource) {
  const path = RESOURCE_PATHS[resource];
  const { data, isLoading, error, mutate } = useSWR<T[]>(path, fetcher, {
    revalidateOnFocus: false,
    errorRetryCount: 3,
  });

  return { data: data ?? [], isLoading, error, mutate };
}
