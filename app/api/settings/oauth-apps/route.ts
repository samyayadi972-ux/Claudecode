import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1) });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apps = await prisma.oAuthApp.findMany({
    select: { id: true, name: true, clientId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  const rawSecret = crypto.randomBytes(24).toString("hex");
  const hashedSecret = await bcrypt.hash(rawSecret, 12);

  const app = await prisma.oAuthApp.create({
    data: { name: parsed.data.name, clientSecret: hashedSecret },
  });

  return NextResponse.json(
    { id: app.id, name: app.name, clientId: app.clientId, clientSecret: rawSecret },
    { status: 201 }
  );
}
