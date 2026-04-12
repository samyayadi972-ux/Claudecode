import { prisma } from "@/lib/db";
import { AcquisitionChannel, ClientStatus } from "@prisma/client";
import Link from "next/link";
import DeleteClientButton from "./DeleteClientButton";

const STATUS_CONFIG: Record<ClientStatus, { label: string; color: string; bg: string }> = {
  LEAD:     { label: "Lead",      color: "#854d0e", bg: "#fef9c3" },
  PROSPECT: { label: "Prospect",  color: "#1e40af", bg: "#dbeafe" },
  CLIENT:   { label: "Client",    color: "#14532d", bg: "#dcfce7" },
  CHURNED:  { label: "Churné",    color: "#7f1d1d", bg: "#fee2e2" },
};

const CHANNEL_CONFIG: Record<AcquisitionChannel, { label: string; color: string; bg: string }> = {
  SMS:          { label: "SMS",        color: "#5b21b6", bg: "#ede9fe" },
  INSTAGRAM:    { label: "Instagram",  color: "#9d174d", bg: "#fce7f3" },
  PAPER_LETTER: { label: "Courrier",   color: "#1e3a5f", bg: "#dbeafe" },
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { search?: string; channel?: string; status?: string };
}) {
  const { search = "", channel, status } = searchParams;

  const [clients, total, leads, prospects, actifs] = await Promise.all([
    prisma.client.findMany({
      where: {
        ...(channel ? { acquisitionChannel: channel as AcquisitionChannel } : {}),
        ...(status  ? { status: status as ClientStatus } : {}),
        ...(search  ? {
          OR: [
            { firstName:  { contains: search, mode: "insensitive" } },
            { lastName:   { contains: search, mode: "insensitive" } },
            { email:      { contains: search, mode: "insensitive" } },
            { phone:      { contains: search } },
            { company:    { contains: search, mode: "insensitive" } },
            { city:       { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count(),
    prisma.client.count({ where: { status: "LEAD" } }),
    prisma.client.count({ where: { status: "PROSPECT" } }),
    prisma.client.count({ where: { status: "CLIENT" } }),
  ]);

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

        {/* KPIs */}
        <div className="flex gap-4 mt-4">
          {[
            { label: "Total",     value: total,      color: "#6366f1" },
            { label: "Leads",     value: leads,      color: "#f59e0b" },
            { label: "Prospects", value: prospects,  color: "#3b82f6" },
            { label: "Clients",   value: actifs,     color: "#10b981" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">
              <span className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</span>
              <span className="text-xs text-gray-400 font-medium">{k.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-3 items-center">
        <form method="GET" className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-2.5 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              name="search"
              defaultValue={search}
              placeholder="Rechercher un contact..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select name="status" defaultValue={status ?? ""} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Tous les statuts</option>
            <option value="LEAD">Lead</option>
            <option value="PROSPECT">Prospect</option>
            <option value="CLIENT">Client</option>
            <option value="CHURNED">Churné</option>
          </select>
          <select name="channel" defaultValue={channel ?? ""} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Tous les canaux</option>
            <option value="SMS">SMS</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="PAPER_LETTER">Courrier</option>
          </select>
          <button type="submit" className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg font-medium text-gray-700">
            Filtrer
          </button>
          {(search || channel || status) && (
            <Link href="/clients" className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600">
              Effacer
            </Link>
          )}
        </form>
        <span className="text-sm text-gray-400">{clients.length} résultat{clients.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <p className="mt-3 text-sm">Aucun contact trouvé</p>
            <Link href="/clients/new" className="mt-3 text-sm text-blue-500 hover:underline">+ Créer le premier contact</Link>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                {["Contact", "Entreprise", "Email", "Téléphone", "Ville", "Statut", "Canal", "Ajouté le", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {clients.map((c) => {
                const s = STATUS_CONFIG[c.status];
                const ch = CHANNEL_CONFIG[c.acquisitionChannel];
                const initials = (c.firstName[0] ?? "") + (c.lastName[0] ?? "");
                const hue = ((c.firstName.charCodeAt(0) ?? 0) * 37) % 360;
                return (
                  <tr key={c.id} className="hover:bg-blue-50/40 transition-colors group">
                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: `hsl(${hue},55%,50%)` }}
                        >
                          {initials.toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/clients/${c.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 whitespace-nowrap"
                          >
                            {c.firstName} {c.lastName}
                          </Link>
                          {c.jobTitle && <p className="text-xs text-gray-400">{c.jobTitle}</p>}
                        </div>
                      </div>
                    </td>
                    {/* Entreprise */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.company ?? <span className="text-gray-200">—</span>}</td>
                    {/* Email */}
                    <td className="px-4 py-3">
                      {c.email
                        ? <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline whitespace-nowrap">{c.email}</a>
                        : <span className="text-gray-200">—</span>}
                    </td>
                    {/* Téléphone */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {c.phone && <a href={`tel:${c.phone}`} className="hover:text-blue-600">{c.phone}</a>}
                    </td>
                    {/* Ville */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {c.city ?? <span className="text-gray-200">—</span>}
                    </td>
                    {/* Statut */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ color: s.color, backgroundColor: s.bg }}
                      >
                        {s.label}
                      </span>
                    </td>
                    {/* Canal */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{ color: ch.color, backgroundColor: ch.bg }}
                      >
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
                        <Link
                          href={`/clients/${c.id}`}
                          className="p-1.5 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600"
                          title="Voir"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                        <Link
                          href={`/clients/${c.id}/edit`}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                          title="Modifier"
                        >
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
