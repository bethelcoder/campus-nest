import { put } from "@vercel/blob";

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
    // Graceful offline development fallback if token is not yet in .env.local
    console.warn("BLOB_READ_WRITE_TOKEN not set. Providing mock URL for local testing.");
    return {
      url: `https://mock-blob.vercel-storage.com/${blobPath}`,
      pathname: blobPath,
      contentType: file.type || "application/octet-stream",
    };
  }

  // Attempt upload handling both public and private Vercel Blob store configurations automatically
  try {
    const blob = await put(blobPath, file, {
      access: "private",
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
    // If the store is configured with public access, retry with public
    if (msg.includes("Cannot use private access on a public store") || msg.includes("public store")) {
      const publicBlob = await put(blobPath, file, {
        access: "public",
        token,
        addRandomSuffix: true,
      });

      return {
        url: publicBlob.url || publicBlob.downloadUrl,
        pathname: publicBlob.pathname,
        contentType: publicBlob.contentType,
      };
    }
    
    // If error was about public access on private store, retry with private (in case initial try was modified)
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
