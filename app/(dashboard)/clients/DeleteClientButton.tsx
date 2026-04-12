"use client";
import { deleteClient } from "./actions";
import { useTransition } from "react";

export default function DeleteClientButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Supprimer ce contact définitivement ?")) return;
    startTransition(() => deleteClient(id));
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-40"
      title="Supprimer"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}
