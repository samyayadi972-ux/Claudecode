import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateBearerToken } from "@/lib/oauth";
import { AcquisitionChannel } from "@prisma/client";

const clientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  acquisitionChannel: z.nativeEnum(AcquisitionChannel).optional(),
});

async function auth(req: NextRequest) {
  return validateBearerToken(req.headers.get("authorization"));
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await auth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await auth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const client = await prisma.client
    .update({ where: { id: params.id }, data: parsed.data })
    .catch(() => null);
  if (!client) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await auth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await prisma.client.delete({ where: { id: params.id } }).catch(() => null);
  return new NextResponse(null, { status: 204 });
}
