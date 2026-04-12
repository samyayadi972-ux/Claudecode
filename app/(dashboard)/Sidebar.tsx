"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  {
    label: "Contacts",
    href: "/clients",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "API & Paramètres",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col w-56 shrink-0 h-full"
      style={{ backgroundColor: "#1b2638", borderRight: "1px solid #243044" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "#243044" }}>
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1" />
          </svg>
          <span className="text-sm font-semibold text-white tracking-tight">FBG Prep Client</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{
                color: active ? "#fff" : "#8fa3bf",
                backgroundColor: active ? "rgba(59,130,246,0.15)" : "transparent",
                borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "#243044" }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: "#3b82f6" }}
          >
            {email[0]?.toUpperCase()}
          </div>
          <span className="text-xs truncate" style={{ color: "#6b8099" }}>
            {email}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-xs transition-colors w-full"
          style={{ color: "#6b8099" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b8099")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
