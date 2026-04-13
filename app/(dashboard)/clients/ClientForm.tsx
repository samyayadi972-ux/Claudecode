import { Client } from "@prisma/client";
import Link from "next/link";

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Client>;
  backHref: string;
  title: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  span,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | null;
  required?: boolean;
  span?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          rows={4}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue ?? ""}
          required={required}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  required,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {!required && <option value="">Sélectionner...</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function ClientForm({ action, defaultValues: d = {}, backHref, title }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="text-gray-400 hover:text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form action={action} className="max-w-3xl mx-auto space-y-5">
          <Section title="Identité">
            <Field label="Prénom"  name="firstName" defaultValue={d.firstName} required placeholder="Jean" />
            <Field label="Nom"     name="lastName"  defaultValue={d.lastName}  required placeholder="Dupont" />
            <Field label="Email"   name="email"     defaultValue={d.email}     type="email" placeholder="jean@exemple.com" />
            <Field label="Téléphone" name="phone"   defaultValue={d.phone}     required placeholder="+33 6 00 00 00 00" />
            <Field label="Mobile"  name="mobile"    defaultValue={d.mobile}    placeholder="+33 7 00 00 00 00" />
          </Section>

          <Section title="Entreprise">
            <Field label="Société"                name="company"         defaultValue={d.company}         placeholder="FBG Corp" />
            <Field label="Nom de boutique Amazon" name="amazonStoreName" defaultValue={d.amazonStoreName} placeholder="Ma Boutique FR" />
            <Field label="Numéro SIREN"           name="sireneNumber"    defaultValue={d.sireneNumber}    placeholder="123 456 789" />
            <Field label="Numéro de TVA"          name="vatNumber"       defaultValue={d.vatNumber}       placeholder="FR 12 345678901" />
          </Section>

          <Section title="Adresse">
            <Field label="Adresse"     name="address"    defaultValue={d.address}    span placeholder="12 rue de la Paix" />
            <Field label="Ville"       name="city"       defaultValue={d.city}       placeholder="Paris" />
            <Field label="Code postal" name="postalCode" defaultValue={d.postalCode} placeholder="75001" />
            <Field label="Pays"        name="country"    defaultValue={d.country}    placeholder="France" />
          </Section>

          <Section title="CRM">
            <SelectField
              label="Statut client"
              name="clientStatus"
              defaultValue={d.clientStatus ?? ""}
              required
              options={[
                { value: "PROSPECT", label: "Prospect" },
                { value: "EN_COURS", label: "En cours d'acquisition" },
                { value: "CLIENT",   label: "Client" },
              ]}
            />
            <SelectField
              label="Statut expédition"
              name="shippingStatus"
              defaultValue={d.shippingStatus ?? ""}
              required
              options={[
                { value: "NOT_SHIPPED",    label: "Pas encore expédié" },
                { value: "FIRST_SHIPPING", label: "Première expédition en cours" },
                { value: "SHIPPED",        label: "Expédition réussie" },
              ]}
            />
            <SelectField
              label="Canal d'acquisition"
              name="acquisitionChannel"
              defaultValue={d.acquisitionChannel ?? ""}
              required
              options={[
                { value: "SMS",            label: "Campagne SMS" },
                { value: "INSTAGRAM",      label: "Campagne Instagram" },
                { value: "PAPER_LETTER",   label: "Courrier papier" },
                { value: "RECOMMENDATION", label: "Recommandation" },
                { value: "PARRAINAGE",     label: "Parrainage" },
                { value: "FORMATION",      label: "Formation" },
              ]}
            />
          </Section>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Notes</h3>
            </div>
            <div className="p-5">
              <Field
                label=""
                name="notes"
                type="textarea"
                defaultValue={d.notes}
                span
                placeholder="Informations complémentaires sur ce contact..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pb-6">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "#f97316" }}
            >
              Enregistrer
            </button>
            <Link
              href={backHref}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
