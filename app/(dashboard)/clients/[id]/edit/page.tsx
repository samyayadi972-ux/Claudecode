import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateClient } from "../../actions";
import ClientForm from "../../ClientForm";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) notFound();

  const action = updateClient.bind(null, client.id);
  return (
    <ClientForm
      action={action}
      defaultValues={client}
      backHref={`/clients/${client.id}`}
      title={`Modifier — ${client.firstName} ${client.lastName}`}
    />
  );
}
