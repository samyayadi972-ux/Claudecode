"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AcquisitionChannel, ClientStatus, ShippingStatus } from "@prisma/client";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Non autorisé");
}

function extractClientData(formData: FormData) {
  return {
    firstName:          formData.get("firstName") as string,
    lastName:           formData.get("lastName") as string,
    email:              (formData.get("email") as string) || null,
    phone:              formData.get("phone") as string,
    mobile:             (formData.get("mobile") as string) || null,
    company:            (formData.get("company") as string) || null,
    amazonStoreName:    (formData.get("amazonStoreName") as string) || null,
    sireneNumber:       (formData.get("sireneNumber") as string) || null,
    vatNumber:          (formData.get("vatNumber") as string) || null,
    address:            (formData.get("address") as string) || null,
    city:               (formData.get("city") as string) || null,
    postalCode:         (formData.get("postalCode") as string) || null,
    country:            (formData.get("country") as string) || null,
    clientStatus:       formData.get("clientStatus") as ClientStatus,
    shippingStatus:     formData.get("shippingStatus") as ShippingStatus,
    acquisitionChannel: formData.get("acquisitionChannel") as AcquisitionChannel,
    notes:              (formData.get("notes") as string) || null,
  };
}

export async function createClient(formData: FormData) {
  await requireSession();
  const client = await prisma.client.create({ data: extractClientData(formData) });
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  await requireSession();
  await prisma.client.update({ where: { id }, data: extractClientData(formData) });
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await requireSession();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}
