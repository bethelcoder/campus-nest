import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadToBlob } from "@/lib/blob";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = (formData.get("type") as string) || "id-document";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Determine target folder based on role and type
    let folder: "students/id-documents" | "landlords/compliance" | "properties/media" | "reports/evidence" = "students/id-documents";
    if (session.role === "LANDLORD") {
      folder = documentType === "property" ? "properties/media" : "landlords/compliance";
    }

    const blobResult = await uploadToBlob(file, {
      userId: session.sub,
      folder,
      filename: file.name,
    });

    return NextResponse.json({
      success: true,
      url: blobResult.url,
      pathname: blobResult.pathname,
      filename: file.name,
      size: file.size,
      contentType: blobResult.contentType,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "File upload failed" }, { status: 500 });
  }
}
