"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Login gagal");
      return;
    }

    // Check admin role after login
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.role !== "admin") {
      setError("Akun ini tidak memiliki akses admin.");
      useAuthStore.getState().logout();
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-card border border-border p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-ink">Admin Panel</h1>
            <p className="text-sm text-muted mt-1">Masuk untuk mengelola BioLearn</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red/5 border border-red/20 text-red text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@biolearn.id"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-alt text-ink placeholder:text-muted-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-alt text-ink placeholder:text-muted-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-bg-alt text-muted"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] touch-manipulation active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <button onClick={() => router.push("/login")} className="text-xs text-muted hover:text-accent transition-colors">
              Kembali ke login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
