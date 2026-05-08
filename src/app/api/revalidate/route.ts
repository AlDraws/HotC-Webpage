import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "crypto";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ message: "Unsupported Media Type" }, { status: 415 });
  }

  const body = await request.json().catch(() => null);
  const webhookSecret = process.env.PRISMIC_WEBHOOK_SECRET;

  const incoming = body?.secret;
  const secretsMatch =
    webhookSecret &&
    typeof incoming === "string" &&
    incoming.length === webhookSecret.length &&
    timingSafeEqual(Buffer.from(incoming), Buffer.from(webhookSecret));

  if (!secretsMatch) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // expire: 0 forces immediate cache invalidation — required for CMS publish webhooks
  revalidateTag("prismic", { expire: 0 });

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
