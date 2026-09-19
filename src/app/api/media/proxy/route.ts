import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return new NextResponse("Missing url query parameter", { status: 400 });
    }

    // Security check: Only allow vercel blob storage URLs or relative public URLs
    const isVercelBlob =
      targetUrl.includes("blob.vercel-storage.com") ||
      targetUrl.includes("private.blob.vercel-storage.com");

    const isLocalUpload = targetUrl.startsWith("/uploads/") || targetUrl.startsWith("uploads/");

    if (!isVercelBlob && !isLocalUpload && !targetUrl.startsWith("http")) {
      return new NextResponse("Invalid URL domain", { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const headers: Record<string, string> = {};

    if (token && isVercelBlob) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(targetUrl, {
      headers,
    });

    if (!response.ok) {
      console.error(
        `[Media Proxy Error] Failed to fetch upstream image: ${response.status} ${response.statusText} from ${targetUrl}`
      );
      return new NextResponse(`Failed to fetch media from upstream: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("[Media Proxy Exception]", err);
    return new NextResponse(err?.message || "Internal Server Error", { status: 500 });
  }
}
