import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from "./errors";

const BUCKET = process.env.S3_BUCKET ?? "jidaar-attachments";
const PRESIGNED_URL_TTL = 3600;

function getClient(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "",
    },
  });
}

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<{ key: string; bucket: string }> {
  try {
    const client = getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    return { key, bucket: BUCKET };
  } catch (err) {
    console.error("S3 upload error:", err);
    throw new AppError(
      500,
      "STORAGE_ERROR",
      err instanceof Error ? `File upload failed: ${err.message}` : "File upload failed"
    );
  }
}

export async function deleteFromS3(key: string): Promise<void> {
  try {
    const client = getClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  } catch (err) {
    console.error("S3 delete error:", err);
    throw new AppError(
      500,
      "STORAGE_ERROR",
      err instanceof Error ? `File delete failed: ${err.message}` : "File delete failed"
    );
  }
}

export async function getPresignedUrl(key: string): Promise<string> {
  try {
    const client = getClient();
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    return getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL });
  } catch (err) {
    console.error("S3 presigned URL error:", err);
    throw new AppError(
      500,
      "STORAGE_ERROR",
      err instanceof Error ? `Failed to generate view URL: ${err.message}` : "Failed to generate view URL"
    );
  }
}

export function generateAttachmentKey(
  prefix: string,
  assignmentId: string,
  filename: string
): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ts = Date.now();
  return `${prefix}/${assignmentId}/${ts}_${safe}`;
}
