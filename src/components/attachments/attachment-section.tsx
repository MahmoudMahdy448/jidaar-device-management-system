"use client";

import { useCallback, useRef, useState } from "react";
import {
  useAssignmentAttachments,
  type AssignmentAttachment,
} from "@/hooks/use-assignment-attachments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  Loader2,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

const ACCEPT = ".pdf,.jpg,.jpeg,.png";
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: string | null): string {
  if (!bytes) return "";
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface AttachmentSectionProps {
  assignmentId: string;
  canEdit?: boolean;
}

export function AttachmentSection({
  assignmentId,
  canEdit = true,
}: AttachmentSectionProps) {
  const { attachments, isLoading, mutate } =
    useAssignmentAttachments(assignmentId);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_SIZE) {
        toast.error(
          `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`
        );
        return;
      }

      const allowed = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowed.includes(file.type)) {
        toast.error("Invalid file type. Only PDF, JPEG, and PNG are allowed.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `/api/assignments/${assignmentId}/attachments`,
          { method: "POST", body: formData }
        );
        const json = await res.json();

        if (!res.ok || json.error) {
          throw new Error(json.error?.message || "Upload failed");
        }

        toast.success("Signed form uploaded successfully");
        mutate();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [assignmentId, mutate]
  );

  const handleDelete = useCallback(
    async (attachmentId: string) => {
      if (!window.confirm("Remove this signed form? This cannot be undone."))
        return;

      setDeleting(attachmentId);
      try {
        const res = await fetch(
          `/api/assignments/${assignmentId}/attachments/${attachmentId}`,
          { method: "DELETE" }
        );
        const json = await res.json();

        if (!res.ok || json.error) {
          throw new Error(json.error?.message || "Delete failed");
        }

        toast.success("Signed form removed");
        mutate();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setDeleting(null);
      }
    },
    [assignmentId, mutate]
  );

  const handleView = useCallback(async (attachmentId: string) => {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}/view`);

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message || "Failed to load file");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to open signed form"
      );
    }
  }, []);

  const signedForm = attachments.find(
    (a: AssignmentAttachment) => a.attachmentType === "SIGNED_ASSIGNMENT_FORM"
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Paperclip className="size-4 text-muted-foreground" />
          Signed Form
        </h3>
        {canEdit && !signedForm && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : signedForm ? (
        <div className="flex items-center justify-between rounded-lg border px-3 py-2">
          <div className="flex items-center gap-3">
            <FileText className="size-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm">{signedForm.filename}</span>
              <span className="text-xs text-muted-foreground">
                {formatSize(signedForm.size)}
                {signedForm.uploadedBy &&
                  ` \u00b7 Uploaded by ${signedForm.uploadedBy.firstName} ${signedForm.uploadedBy.lastName}`}
                {" \u00b7 "}
                {formatDate(signedForm.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleView(signedForm.id)}
              title="View signed form"
            >
              <ExternalLink className="size-4" />
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={deleting === signedForm.id}
                onClick={() => handleDelete(signedForm.id)}
                title="Remove signed form"
              >
                {deleting === signedForm.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4 text-destructive" />
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          No signed form uploaded yet.
        </p>
      )}

      {attachments.filter(
        (a: AssignmentAttachment) =>
          a.attachmentType !== "SIGNED_ASSIGNMENT_FORM"
      ).length > 0 && (
        <div className="flex flex-col gap-2">
          {attachments
            .filter(
              (a: AssignmentAttachment) =>
                a.attachmentType !== "SIGNED_ASSIGNMENT_FORM"
            )
            .map((att: AssignmentAttachment) => (
              <div
                key={att.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm">{att.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatSize(att.size)}
                      {" \u00b7 "}
                      <Badge variant="outline" className="text-xs">
                        {att.attachmentType.replace(/_/g, " ")}
                      </Badge>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleView(att.id)}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={deleting === att.id}
                      onClick={() => handleDelete(att.id)}
                    >
                      {deleting === att.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4 text-destructive" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
