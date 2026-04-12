"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function RevokeAppButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRevoke() {
    if (!confirm("Révoquer cette application ? Tous ses tokens seront supprimés.")) return;
    startTransition(async () => {
      await fetch(`/api/settings/oauth-apps/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={pending}
      className="text-red-500 hover:underline text-sm disabled:opacity-50"
    >
      Révoquer
    </button>
  );
}
