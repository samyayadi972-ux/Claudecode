import { prisma } from "@/lib/db";
import { AcquisitionChannel, ClientStatus, ShippingStatus } from "@prisma/client";
import Link from "next/link";
import DeleteClientButton from "./DeleteClientButton";

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

const CHANNEL_CONFIG: Record<AcquisitionChannel, { label: string; color: string; bg: string; bar: string }> = {
  SMS:            { label: "SMS",             color: "#5b21b6", bg: "#ede9fe", bar: "#7c3aed" },
  INSTAGRAM:      { label: "Instagram",       color: "#9d174d", bg: "#fce7f3", bar: "#db2777" },
  PAPER_LETTER:   { label: "Courrier papier", color: "#1e3a5f", bg: "#dbeafe", bar: "#3b82f6" },
  RECOMMENDATION: { label: "Recommandation",  color: "#065f46", bg: "#d1fae5", bar: "#10b981" },
  PARRAINAGE:     { label: "Parrainage",       color: "#92400e", bg: "#fef3c7", bar: "#f59e0b" },
  FORMATION:      { label: "Formation",        color: "#3730a3", bg: "#e0e7ff", bar: "#6366f1" },
};

const CHANNEL_ORDER: AcquisitionChannel[] = ["SMS", "INSTAGRAM", "PAPER_LETTER", "RECOMMENDATION", "PARRAINAGE", "FORMATION"];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { search?: string; channel?: string; clientStatus?: string; shippingStatus?: string };
}) {
  const { search = "", channel, clientStatus, shippingStatus } = searchParams;

  const [clients, total, channelStats] = await Promise.all([
    prisma.client.findMany({
      where: {
        ...(channel        ? { acquisitionChannel: channel as AcquisitionChannel } : {}),
        ...(clientStatus   ? { clientStatus: clientStatus as ClientStatus }         : {}),
        ...(shippingStatus ? { shippingStatus: shippingStatus as ShippingStatus }   : {}),
        ...(search ? {
          OR: [
            { firstName:      { contains: search, mode: "insensitive" } },
            { lastName:       { contains: search, mode: "insensitive" } },
            { email:          { contains: search, mode: "insensitive" } },
            { phone:          { contains: search } },
            { company:        { contains: search, mode: "insensitive" } },
            { amazonStoreName:{ contains: search, mode: "insensitive" } },
            { city:           { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count(),
    prisma.client.groupBy({ by: ["acquisitionChannel"], _count: { _all: true } }),
  ]);

  const channelCounts = Object.fromEntries(
    channelStats.map((s) => [s.acquisitionChannel, s._count._all])
  ) as Partial<Record<AcquisitionChannel, number>>;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} contacts au total</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#f97316" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau contact
          </Link>
        </div>
      </div>

      {/* Stats par canal */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex gap-3">
        {/* Carte Total */}
        <div className="rounded-xl p-5 flex flex-col justify-between shrink-0 w-44" style={{ backgroundColor: "#1b2638" }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total clients</p>
          <p className="text-5xl font-bold text-white mt-2 leading-none">{total}</p>
          <p className="text-xs text-gray-500 mt-3">tous canaux confondus</p>
        </div>

        {/* Cartes par canal */}
        <div className="grid grid-cols-3 gap-3 flex-1">
          {CHANNEL_ORDER.map((ch) => {
            const cfg   = CHANNEL_CONFIG[ch];
            const count = channelCounts[ch] ?? 0;
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={ch} className="rounded-xl border border-gray-100 p-3 bg-white hover:shadow-sm transition-shadow">
                <p className="text-xs font-semibold uppercase tracking-wide truncate" style={{ color: cfg.color }}>{cfg.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 leading-none">{count}</p>
                <div className="mt-2 h-1.5 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cfg.bar }} />
                </div>
                <p className="text-sm font-semibold mt-1.5" style={{ color: cfg.bar }}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-3 items-center flex-wrap">
        <form method="GET" className="flex gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg className="absolute left-3 top-2.5 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              name="search"
              defaultValue={search}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select name="clientStatus" defaultValue={clientStatus ?? ""} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Tous les statuts</option>
            <option value="PROSPECT">Prospect</option>
            <option value="EN_COURS">En cours d&apos;acquisition</option>
            <option value="CLIENT">Client</option>
          </select>
          <select name="shippingStatus" defaultValue={shippingStatus ?? ""} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Toutes les expéditions</option>
            <option value="NOT_SHIPPED">Pas encore expédié</option>
            <option value="FIRST_SHIPPING">1ère expédition en cours</option>
            <option value="SHIPPED">Expédition réussie</option>
          </select>
          <select name="channel" defaultValue={channel ?? ""} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Tous les canaux</option>
            <option value="SMS">SMS</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="PAPER_LETTER">Courrier papier</option>
            <option value="RECOMMENDATION">Recommandation</option>
            <option value="PARRAINAGE">Parrainage</option>
            <option value="FORMATION">Formation</option>
          </select>
          <button type="submit" className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg font-medium text-gray-700">
            Filtrer
          </button>
          {(search || channel || clientStatus || shippingStatus) && (
            <Link href="/clients" className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600">
              Effacer
            </Link>
          )}
        </form>
        <span className="text-sm text-gray-400 shrink-0">{clients.length} résultat{clients.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
            <p className="mt-3 text-sm">Aucun contact trouvé</p>
            <Link href="/clients/new" className="mt-3 text-sm text-blue-500 hover:underline">+ Créer le premier contact</Link>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                {["Contact", "Boutique Amazon", "Email", "Téléphone", "Ville", "Statut client", "Expédition", "Canal", "Ajouté le", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {clients.map((c) => {
                const cs  = CLIENT_STATUS[c.clientStatus];
                const ss  = SHIPPING_STATUS[c.shippingStatus];
                const ch  = CHANNEL_CONFIG[c.acquisitionChannel];
                const initials = (c.firstName[0] ?? "") + (c.lastName[0] ?? "");
                const hue = ((c.firstName.charCodeAt(0) ?? 0) * 37) % 360;
                return (
                  <tr key={c.id} className="hover:bg-blue-50/40 transition-colors group">
                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: `hsl(${hue},55%,50%)` }}>
                          {initials.toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/clients/${c.id}`} className="font-semibold text-gray-900 hover:text-blue-600 whitespace-nowrap">
                            {c.firstName} {c.lastName}
                          </Link>
                          {c.company && <p className="text-xs text-gray-400">{c.company}</p>}
                        </div>
                      </div>
                    </td>
                    {/* Boutique Amazon */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.amazonStoreName ?? <span className="text-gray-200">—</span>}</td>
                    {/* Email */}
                    <td className="px-4 py-3">
                      {c.email ? <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline whitespace-nowrap">{c.email}</a> : <span className="text-gray-200">—</span>}
                    </td>
                    {/* Téléphone */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <a href={`tel:${c.phone}`} className="hover:text-blue-600">{c.phone}</a>
                    </td>
                    {/* Ville */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.city ?? <span className="text-gray-200">—</span>}</td>
                    {/* Statut client */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap" style={{ color: cs.color, backgroundColor: cs.bg }}>
                        {cs.label}
                      </span>
                    </td>
                    {/* Expédition */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap" style={{ color: ss.color, backgroundColor: ss.bg }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ss.dot }} />
                        {ss.label}
                      </span>
                    </td>
                    {/* Canal */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style={{ color: ch.color, backgroundColor: ch.bg }}>
                        {ch.label}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/clients/${c.id}`} className="p-1.5 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600" title="Voir">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                        <Link href={`/clients/${c.id}/edit`} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Modifier">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                        <DeleteClientButton id={c.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
