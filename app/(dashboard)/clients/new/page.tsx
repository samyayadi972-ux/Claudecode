import { createClient } from "../actions";
import ClientForm from "../ClientForm";

export default function NewClientPage() {
  return <ClientForm action={createClient} backHref="/clients" title="Nouveau contact" />;
}
