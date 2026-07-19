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

export interface AssignmentAttachment {
  id: string;
  filename: string;
  mimeType: string | null;
  size: string | null;
  attachmentType: string;
  createdAt: string;
  uploadedBy: { id: string; firstName: string; lastName: string } | null;
}

export function useAssignmentAttachments(assignmentId: string | null) {
  const { data, isLoading, error, mutate } = useSWR(
    assignmentId ? `/api/assignments/${assignmentId}/attachments` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    attachments: (data?.data ?? []) as AssignmentAttachment[],
    isLoading,
    error,
    mutate,
  };
}
