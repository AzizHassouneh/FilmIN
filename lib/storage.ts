// Image storage abstraction. Headshot/photo uploads are FREE for everyone —
// this is the IMDbPro-killer (scenario S1).
// When CLOUDINARY_URL is set (production), uploads go to Cloudinary.
// Otherwise files are written to public/uploads (local dev).
import { randomUUID } from "node:crypto";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export class UploadError extends Error {}

export async function saveUpload(file: File): Promise<string> {
  if (!file || file.size === 0) throw new UploadError("No file provided.");
  if (file.size > MAX_BYTES) throw new UploadError("Image must be 5 MB or smaller.");
  if (!ALLOWED.has(file.type)) throw new UploadError("Use a JPEG, PNG, or WebP image.");

  if (process.env.CLOUDINARY_URL) {
    return uploadToCloudinary(file);
  }
  return uploadToLocal(file);
}

async function uploadToCloudinary(file: File): Promise<string> {
  const { v2: cloudinary } = await import("cloudinary");
  // CLOUDINARY_URL is parsed automatically by the SDK (set via env var).
  const buffer = Buffer.from(await file.arrayBuffer());
  const b64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "filmin/headshots",
    public_id: randomUUID(),
    overwrite: false,
    resource_type: "image",
    transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
  });

  return result.secure_url;
}

async function uploadToLocal(file: File): Promise<string> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}
