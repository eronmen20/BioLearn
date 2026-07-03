"use client";

import { useLangStore } from "@/lib/lang-store";
import { useAuthStore } from "@/lib/auth-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, Menu, Shield, Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";

export function Header() {
  const { lang, setLang, t } = useLangStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { resolved, setTheme } = useThemeStore();
  const mounted = useIsMounted();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-b border-border/50 z-50 flex items-center justify-between px-3 sm:px-5">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <label htmlFor="sidebar-toggle" className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-bg-alt cursor-pointer select-none">
          <Menu className="w-5 h-5 text-ink" />
        </label>

        <Link href="/" className="text-lg sm:text-xl font-extrabold whitespace-nowrap">
          <span className="gradient-text">Bio</span>
          <span className="bg-gradient-to-r from-[#fd79a8] to-[#fdcb6e] bg-clip-text text-transparent">Learn</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-bg-alt transition-colors"
          title={resolved === "dark" ? "Mode Terang" : "Mode Gelap"}
        >
          {resolved === "dark" ? (
            <Sun className="w-4 h-4 text-yellow" />
          ) : (
            <Moon className="w-4 h-4 text-muted" />
          )}
        </button>

        {/* Language toggle */}
        <div className="flex gap-1 bg-border/50 rounded-full p-[3px]">
          <button
            onClick={() => setLang("id")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              lang === "id" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            ID
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              lang === "en" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            EN
          </button>
        </div>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          {mounted && isAuthenticated && user ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full hover:bg-bg-alt transition-colors border border-transparent hover:border-border"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-ink max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden animate-slide-down z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-ink">{user.name}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                      {user.role === "admin" ? t("role.admin") : t("role.student")}
                    </span>
                  </div>
                  <div className="p-1">
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm text-accent hover:bg-accent/5 rounded-xl transition-colors font-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red hover:bg-red/5 rounded-xl transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("auth.signout")}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-dark transition-colors shadow-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden xs:inline">{t("auth.login")}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}