import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const webhookSecret = process.env.PRISMIC_WEBHOOK_SECRET;

  if (!webhookSecret || body?.secret !== webhookSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("prismic", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
