import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AcquisitionChannel, ClientStatus, ShippingStatus } from "@prisma/client";

const CHANNEL_LABEL: Record<AcquisitionChannel, string> = {
  SMS:            "Campagne SMS",
  INSTAGRAM:      "Campagne Instagram",
  PAPER_LETTER:   "Courrier papier",
  RECOMMENDATION: "Recommandation",
};

const CLIENT_STATUS: Record<ClientStatus, { label: string; color: string; bg: string }> = {
  PROSPECT: { label: "Prospect",             color: "#1e40af", bg: "#dbeafe" },
  EN_COURS: { label: "En cours d'acq.",      color: "#92400e", bg: "#fef3c7" },
  CLIENT:   { label: "Client",               color: "#14532d", bg: "#dcfce7" },
};

const SHIPPING_STATUS: Record<ShippingStatus, { label: string; color: string; bg: string; dot: string }> = {
  NOT_SHIPPED:    { label: "Pas encore expédié",       color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
  FIRST_SHIPPING: { label: "1ère expédition en cours", color: "#92400e", bg: "#fff7ed", dot: "#f97316" },
  SHIPPED:        { label: "Expédition réussie",       color: "#14532d", bg: "#dcfce7", dot: "#22c55e" },
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || <span className="text-gray-300 italic">Non renseigné</span>}</p>
    </div>
  );
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) notFound();

  const cs  = CLIENT_STATUS[client.clientStatus];
  const ss  = SHIPPING_STATUS[client.shippingStatus];
  const initials = (client.firstName[0] ?? "") + (client.lastName[0] ?? "");
  const hue = ((client.firstName.charCodeAt(0) ?? 0) * 37) % 360;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/clients" className="text-gray-400 hover:text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-400">Contacts</span>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">{client.firstName} {client.lastName}</span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Colonne gauche — Profil */}
        <div className="w-72 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          {/* Avatar + nom */}
          <div className="p-6 border-b border-gray-100 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-3"
              style={{ backgroundColor: `hsl(${hue},55%,50%)` }}
            >
              {initials.toUpperCase()}
            </div>
            <h2 className="font-semibold text-gray-900 text-lg">{client.firstName} {client.lastName}</h2>
            {client.company && <p className="text-sm text-gray-500 mt-0.5 font-medium">{client.company}</p>}
            {client.amazonStoreName && <p className="text-xs text-gray-400 mt-0.5">🛒 {client.amazonStoreName}</p>}
            <div className="mt-3 flex flex-col items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ color: cs.color, backgroundColor: cs.bg }}>
                {cs.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ color: ss.color, backgroundColor: ss.bg }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.dot }} />
                {ss.label}
              </span>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="p-4 border-b border-gray-100 flex gap-2 justify-center">
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 text-xs"
                title="Envoyer un email"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </a>
            )}
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 text-xs"
                title="Appeler"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 10.91a16 16 0 0 0 6 6l1.27-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.21v-1.29z" />
                </svg>
                Appel
              </a>
            )}
            {client.mobile && (
              <a
                href={`sms:${client.mobile}`}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 text-xs"
                title="SMS"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                SMS
              </a>
            )}
          </div>

          {/* Infos */}
          <div className="px-5 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">Informations de contact</p>
            <Field label="Email" value={client.email} />
            <Field label="Téléphone" value={client.phone} />
            <Field label="Mobile" value={client.mobile} />
          </div>
          <div className="px-5 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">Entreprise</p>
            <Field label="Société"        value={client.company} />
            <Field label="Boutique Amazon" value={client.amazonStoreName} />
            <Field label="SIREN"          value={client.sireneNumber} />
            <Field label="N° TVA"          value={client.vatNumber} />
          </div>
          <div className="px-5 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">Adresse</p>
            <Field label="Adresse" value={client.address} />
            <Field label="Ville" value={client.city} />
            <Field label="Code postal" value={client.postalCode} />
            <Field label="Pays" value={client.country} />
          </div>
          <div className="px-5 py-2 pb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide py-2">Acquisition</p>
            <Field label="Statut client"    value={CLIENT_STATUS[client.clientStatus].label} />
            <Field label="Expédition"       value={SHIPPING_STATUS[client.shippingStatus].label} />
            <Field label="Canal"            value={CHANNEL_LABEL[client.acquisitionChannel]} />
            <Field label="Ajouté le" value={new Date(client.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} />
            <Field label="Mis à jour" value={new Date(client.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} />
          </div>
        </div>

        {/* Colonne droite — Notes & Activité */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Notes
            </h3>
            {client.notes ? (
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{client.notes}</p>
            ) : (
              <p className="text-sm text-gray-300 italic">Aucune note pour ce contact.</p>
            )}
          </div>

          {/* Fiche récapitulative */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              Récapitulatif
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Nom complet",  value: `${client.firstName} ${client.lastName}` },
                { label: "Email",        value: client.email ?? "—" },
                { label: "Téléphone",    value: client.phone },
                { label: "Mobile",       value: client.mobile ?? "—" },
                { label: "Société",         value: client.company ?? "—" },
                { label: "Boutique Amazon", value: client.amazonStoreName ?? "—" },
                { label: "SIREN",          value: client.sireneNumber ?? "—" },
                { label: "N° TVA",          value: client.vatNumber ?? "—" },
                { label: "Ville",           value: client.city ?? "—" },
                { label: "Pays",            value: client.country ?? "—" },
                { label: "Statut client",   value: CLIENT_STATUS[client.clientStatus].label },
                { label: "Expédition",      value: SHIPPING_STATUS[client.shippingStatus].label },
                { label: "Canal",           value: CHANNEL_LABEL[client.acquisitionChannel] },
              ].map((f) => (
                <div key={f.label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{f.label}</p>
                  <p className="text-sm text-gray-800 mt-0.5 font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
