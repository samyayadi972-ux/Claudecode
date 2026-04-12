"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startLockTimer(seconds: number) {
    setLocked(true);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setLocked(false);
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function formatCountdown(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked || loading) return;
    setLoading(true);
    setError("");

    // Vérification rate limit côté API
    const check = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (check.status === 429) {
      const data = await check.json();
      startLockTimer(data.retryAfterSeconds);
      setError(data.message);
      setLoading(false);
      return;
    }

    if (!check.ok) {
      setLoading(false);
      setError("Email ou mot de passe incorrect.");
      return;
    }

    // Authentification NextAuth
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/clients");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Glow background subtle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm px-4">
        {/* Logo / Titre */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="14,2 26,9 26,19 14,26 2,19 2,9"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
              <polygon
                points="14,7 21,11 21,17 14,21 7,17 7,11"
                fill="rgba(59,130,246,0.15)"
                stroke="#3b82f6"
                strokeWidth="1"
              />
            </svg>
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "#f5f5f5", letterSpacing: "-0.02em" }}
            >
              FBG Prep Client
            </span>
          </div>
          <p style={{ color: "#555", fontSize: "0.85rem" }}>
            Connectez-vous à votre espace
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: "#111",
            border: "1px solid #1f1f1f",
            boxShadow: "0 0 0 1px #1a1a1a, 0 24px 48px rgba(0,0,0,0.6)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: "#555" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={locked}
                autoComplete="email"
                className="w-full rounded-lg px-4 py-3 text-sm transition-all outline-none"
                style={{
                  backgroundColor: "#0d0d0d",
                  border: "1px solid #222",
                  color: "#e5e5e5",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#222";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-widest"
                style={{ color: "#555" }}
              >
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={locked}
                autoComplete="current-password"
                className="w-full rounded-lg px-4 py-3 text-sm transition-all outline-none"
                style={{
                  backgroundColor: "#0d0d0d",
                  border: "1px solid #222",
                  color: "#e5e5e5",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#222";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Erreur / Timer */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm flex items-center gap-2"
                style={{
                  backgroundColor: locked
                    ? "rgba(234,179,8,0.08)"
                    : "rgba(239,68,68,0.08)",
                  border: locked
                    ? "1px solid rgba(234,179,8,0.2)"
                    : "1px solid rgba(239,68,68,0.2)",
                  color: locked ? "#ca8a04" : "#ef4444",
                }}
              >
                {locked && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                <span>
                  {locked
                    ? `Compte temporairement bloqué — ${formatCountdown(countdown)}`
                    : error}
                </span>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || locked}
              className="w-full rounded-lg py-3 text-sm font-semibold transition-all"
              style={{
                backgroundColor: locked ? "#1a1a1a" : "#3b82f6",
                color: locked ? "#444" : "#fff",
                cursor: locked ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                if (!locked && !loading)
                  e.currentTarget.style.backgroundColor = "#2563eb";
              }}
              onMouseLeave={(e) => {
                if (!locked && !loading)
                  e.currentTarget.style.backgroundColor = "#3b82f6";
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Connexion...
                </span>
              ) : locked ? (
                `Bloqué — ${formatCountdown(countdown)}`
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p
          className="text-center mt-6 text-xs"
          style={{ color: "#333" }}
        >
          FBG Prep Client &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
