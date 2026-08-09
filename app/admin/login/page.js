"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      const from = searchParams.get("from");
      router.push(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 bg-grid-faint bg-grid px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo className="h-9 w-9" withWordmark dark />
        </div>
        <div className="bg-paper-100 rounded-2xl shadow-lift p-7">
          <h1 className="font-display text-xl font-semibold text-ink-900">Admin sign in</h1>
          <p className="text-sm text-ink-500 mt-1">Manage links, analytics, and the blog.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink-600 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-ink-200 bg-paper-200 px-3.5 py-2.5 text-sm outline-none focus:border-signal-500 focus:bg-paper-100 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ink-200 bg-paper-200 px-3.5 py-2.5 text-sm outline-none focus:border-signal-500 focus:bg-paper-100 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-signal-600 bg-signal-50 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-ink-900 text-paper-100 py-2.5 text-sm font-medium hover:bg-ink-800 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-ink-400 mt-5">
          Credentials are set in <code className="font-mono">.env.local</code> — see SETUP.md.
        </p>
      </div>
    </div>
  );
}
