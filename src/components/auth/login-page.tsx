"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useLangStore } from "@/lib/lang-store";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginPage() {
  const router = useRouter();
  const { t } = useLangStore();
  const { login, register, isLoading, isAuthenticated } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">🧬</div>
          <p className="text-muted">{t("auth.redirecting")}</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      const result = await login(email, password);
      if (result.success) {
        router.push("/dashboard");
      } else if (result.needsVerification) {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(result.error || t("auth.error"));
      }
    } else {
      const result = await register(email, password, name);
      if (result.success && result.needsVerification) {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || t("auth.error"));
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-3xl shadow-xl border border-border p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🧬</div>
            <h1 className="text-2xl font-extrabold">
              <span className="gradient-text">Bio</span>
              <span className="bg-gradient-to-r from-[#fd79a8] to-[#fdcb6e] bg-clip-text text-transparent">Learn</span>
            </h1>
            <p className="text-muted text-sm mt-1">
              {mode === "login" ? t("auth.subtitle_login") : t("auth.subtitle_register")}
            </p>
          </div>

          {error && (
            <div className="bg-red/10 border border-red text-red rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">{t("auth.name")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("auth.name_placeholder")}
                  required
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm outline-none focus:border-accent-light transition-colors bg-surface"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email_placeholder")}
                required
                className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm outline-none focus:border-accent-light transition-colors bg-surface"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">{t("auth.password")}</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.password_placeholder")}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 border-2 border-border rounded-xl text-sm outline-none focus:border-accent-light transition-colors bg-surface"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-muted"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === "login" && (
                <div className="text-right">
                  <button type="button" onClick={() => router.push("/forgot-password")} className="text-xs text-accent font-semibold hover:underline">
                    Lupa password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? t("auth.submit_login") : t("auth.submit_register")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            {mode === "login" ? (
              <>
                {t("auth.no_account")}{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-accent font-semibold hover:underline">
                  {t("auth.register")}
                </button>
              </>
            ) : (
              <>
                {t("auth.has_account")}{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-accent font-semibold hover:underline">
                  {t("auth.login_link")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
