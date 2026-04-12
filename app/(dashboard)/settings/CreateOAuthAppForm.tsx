"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateOAuthAppForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    clientId: string;
    clientSecret: string;
    name: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/settings/oauth-apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setResult(data);
      setName("");
      router.refresh();
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'application (ex: HubSpot)"
          required
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer une app OAuth"}
        </button>
      </form>

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">
            App creee : {result.name}
          </p>
          <p className="text-xs text-red-600 mb-3">
            Copiez le secret maintenant — il ne sera plus affiché.
          </p>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-gray-500">client_id : </span>
              <span className="select-all">{result.clientId}</span>
            </div>
            <div>
              <span className="text-gray-500">client_secret : </span>
              <span className="select-all font-bold">{result.clientSecret}</span>
            </div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
