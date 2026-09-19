import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export interface UploadOptions {
  userId: string;
  folder: "students/id-documents" | "landlords/compliance" | "properties/media" | "reports/evidence";
  filename: string;
}

export async function uploadToBlob(
  file: File | Blob,
  options: UploadOptions
): Promise<{ url: string; pathname: string; contentType: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  // Clean filename of spaces and special chars
  const sanitizedName = options.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const blobPath = `${options.folder}/${options.userId}-${Date.now()}-${sanitizedName}`;

  if (!token) {
    // Local development fallback: Save file to public/uploads directory so browser can preview it directly
    try {
      const publicUploadsDir = path.join(process.cwd(), "public", "uploads", options.folder);
      await fs.mkdir(publicUploadsDir, { recursive: true });
      
      const fileNameOnDisk = `${options.userId}-${Date.now()}-${sanitizedName}`;
      const localFilePath = path.join(publicUploadsDir, fileNameOnDisk);
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(localFilePath, buffer);

      const localUrl = `/uploads/${options.folder}/${fileNameOnDisk}`;
      return {
        url: localUrl,
        pathname: localUrl,
        contentType: file.type || "application/octet-stream",
      };
    } catch (fsErr) {
      console.error("Local file save fallback error:", fsErr);
      // Data URI fallback if disk write is not accessible
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUri = `data:${file.type || "image/png"};base64,${base64}`;
      return {
        url: dataUri,
        pathname: blobPath,
        contentType: file.type || "application/octet-stream",
      };
    }
  }

  // Attempt upload handling both public and private Vercel Blob store configurations automatically
  try {
    const blob = await put(blobPath, file, {
      access: "public",
      token,
      addRandomSuffix: true,
    });

    return {
      url: blob.url || blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
    };
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Cannot use public access on a private store") || msg.includes("private store")) {
      const privateBlob = await put(blobPath, file, {
        access: "private",
        token,
        addRandomSuffix: true,
      });

      return {
        url: privateBlob.url || privateBlob.downloadUrl,
        pathname: privateBlob.pathname,
        contentType: privateBlob.contentType,
      };
    }

    throw err;
  }
}
