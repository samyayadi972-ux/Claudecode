import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { grant_type, client_id, client_secret } = body;

  if (grant_type !== "client_credentials") {
    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400 }
    );
  }

  if (!client_id || !client_secret) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const app = await prisma.oAuthApp.findUnique({ where: { clientId: client_id } });
  if (!app) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  const valid = await bcrypt.compare(client_secret, app.clientSecret);
  if (!valid) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  const accessToken = crypto.randomBytes(32).toString("hex");
  const expiresIn = 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  await prisma.oAuthToken.create({
    data: { accessToken, expiresAt, appId: app.id },
  });

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: expiresIn,
  });
}
