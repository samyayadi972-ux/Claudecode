import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(ip);

  if (!allowed) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    return NextResponse.json(
      {
        error: "too_many_attempts",
        message: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
        retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  const valid = user ? await bcrypt.compare(body.password, user.password) : false;

  if (!valid) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  resetRateLimit(ip);
  return NextResponse.json({ ok: true });
}
