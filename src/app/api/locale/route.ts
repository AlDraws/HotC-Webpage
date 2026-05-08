import { NextRequest, NextResponse } from "next/server";
import { isAppLocale, LOCALE_COOKIE_NAME } from "@/lib/locale";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const locale = body?.locale;

  if (!isAppLocale(locale)) {
    return NextResponse.json({ message: "Invalid locale" }, { status: 400 });
  }

  const secure = request.nextUrl.protocol === "https:";
  const response = NextResponse.json({ ok: true });
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
    secure,
  });

  return response;
}
