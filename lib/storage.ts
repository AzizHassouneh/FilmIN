// Image storage abstraction. Headshot/photo uploads are FREE for everyone —
// this is the IMDbPro-killer (scenario S1). Dev writes to public/uploads;
// prod can swap in Cloudinary/S3 behind the same saveUpload() signature.
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export class UploadError extends Error {}

/**
 * Persist an uploaded image and return its public URL.
 * Throws UploadError on a missing/oversized/unsupported file.
 */
export async function saveUpload(file: File): Promise<string> {
  if (!file || file.size === 0) throw new UploadError("No file provided.");
  if (file.size > MAX_BYTES) throw new UploadError("Image must be 5 MB or smaller.");

  const ext = ALLOWED.get(file.type);
  if (!ext) throw new UploadError("Use a JPEG, PNG, or WebP image.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}
