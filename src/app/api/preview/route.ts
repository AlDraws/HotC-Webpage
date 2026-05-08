import { NextRequest, NextResponse } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";
import { createClient } from "../../../prismicio";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const documentId = request.nextUrl.searchParams.get("documentId");

  if (!token || !documentId) {
    return new NextResponse("Missing preview parameters", { status: 400 });
  }

  const client = createClient();

  try {
    return await redirectToPreviewURL({ client, request });
  } catch {
    return new NextResponse("Preview failed", { status: 500 });
  }
}
