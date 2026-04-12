import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateBearerToken } from "@/lib/oauth";
import { AcquisitionChannel } from "@prisma/client";

const clientSchema = z.object({
  firstName:          z.string().min(1),
  lastName:           z.string().min(1),
  email:              z.string().email().optional().nullable(),
  phone:              z.string().min(1),
  mobile:             z.string().optional().nullable(),
  company:            z.string().optional().nullable(),
  jobTitle:           z.string().optional().nullable(),
  address:            z.string().optional().nullable(),
  city:               z.string().optional().nullable(),
  postalCode:         z.string().optional().nullable(),
  country:            z.string().optional().nullable(),
  acquisitionChannel: z.nativeEnum(AcquisitionChannel),
  notes:              z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const authorized = await validateBearerToken(req.headers.get("authorization"));
  if (!authorized) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search  = searchParams.get("search") ?? "";
  const channel = searchParams.get("channel") as AcquisitionChannel | null;
  const clients = await prisma.client.findMany({
    where: {
      ...(channel ? { acquisitionChannel: channel } : {}),
      ...(search  ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName:  { contains: search, mode: "insensitive" } },
          { email:     { contains: search, mode: "insensitive" } },
          { phone:     { contains: search } },
          { company:   { contains: search, mode: "insensitive" } },
          { city:      { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const authorized = await validateBearerToken(req.headers.get("authorization"));
  if (!authorized) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body   = await req.json().catch(() => null);
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_data", details: parsed.error.flatten() }, { status: 400 });
  }

  const client = await prisma.client.create({ data: parsed.data });
  return NextResponse.json(client, { status: 201 });
}
