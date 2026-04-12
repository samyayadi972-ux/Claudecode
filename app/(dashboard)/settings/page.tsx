import { prisma } from "@/lib/db";
import CreateOAuthAppForm from "./CreateOAuthAppForm";
import RevokeAppButton from "./RevokeAppButton";

export default async function SettingsPage() {
  const apps = await prisma.oAuthApp.findMany({
    select: { id: true, name: true, clientId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API & Paramètres</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-1">Documentation API</h2>
        <p className="text-sm text-gray-500 mb-4">
          Utilisez l&apos;API REST pour connecter FBG Prep Client à HubSpot ou tout autre outil externe.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono space-y-2 text-gray-700">
          <div>
            <span className="text-blue-600">POST</span> /api/oauth/token{" "}
            <span className="text-gray-400">— obtenir un access token</span>
          </div>
          <div>
            <span className="text-green-600">GET</span> /api/clients{" "}
            <span className="text-gray-400">— lister les clients</span>
          </div>
          <div>
            <span className="text-blue-600">POST</span> /api/clients{" "}
            <span className="text-gray-400">— créer un client</span>
          </div>
          <div>
            <span className="text-green-600">GET</span> /api/clients/:id{" "}
            <span className="text-gray-400">— détail d&apos;un client</span>
          </div>
          <div>
            <span className="text-yellow-600">PUT</span> /api/clients/:id{" "}
            <span className="text-gray-400">— modifier un client</span>
          </div>
          <div>
            <span className="text-red-500">DELETE</span> /api/clients/:id{" "}
            <span className="text-gray-400">— supprimer un client</span>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">Exemple d&apos;authentification :</p>

          <pre className="text-gray-600 whitespace-pre-wrap">{`POST /api/oauth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "votre-client-id",
  "client_secret": "votre-client-secret"
}

→ { "access_token": "...", "token_type": "Bearer", "expires_in": 3600 }

GET /api/clients
Authorization: Bearer <access_token>`}</pre>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Applications OAuth</h2>
        <CreateOAuthAppForm />

        {apps.length > 0 && (
          <div className="mt-6">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 font-medium text-gray-600">Nom</th>
                  <th className="text-left py-2 font-medium text-gray-600">Client ID</th>
                  <th className="text-left py-2 font-medium text-gray-600">Créée le</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apps.map((app) => (
                  <tr key={app.id}>
                    <td className="py-3 font-medium">{app.name}</td>
                    <td className="py-3 font-mono text-xs text-gray-500">{app.clientId}</td>
                    <td className="py-3 text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3">
                      <RevokeAppButton id={app.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
