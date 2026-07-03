"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  ChevronDown,
  Menu,
  Bell,
  Search,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";

export function AdminHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const mounted = useIsMounted();
  const { resolved: themeResolved, setTheme } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  // Breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface/95 backdrop-blur-xl border-b border-border/50 z-50 flex items-center justify-between px-3 sm:px-5">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <label
          htmlFor="admin-sidebar-toggle"
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-bg-alt cursor-pointer select-none"
        >
          <Menu className="w-5 h-5 text-ink" />
        </label>

        {/* Back to site */}
        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Site
        </Link>

        <div className="hidden sm:block w-px h-5 bg-border mx-1" />

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/admin" className="text-muted hover:text-accent transition-colors font-medium">
            Admin
          </Link>
          {breadcrumbs.slice(1).map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <span className="text-muted-2">/</span>
              {crumb.isLast ? (
                <span className="text-ink font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-muted hover:text-accent transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(themeResolved === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-lg hover:bg-bg-alt flex items-center justify-center transition-colors"
          title="Toggle tema"
        >
          {mounted && themeResolved === "dark" ? (
            <Sun className="w-4 h-4 text-yellow" />
          ) : (
            <Moon className="w-4 h-4 text-muted" />
          )}
        </button>

        {/* Search */}
        <button className="w-9 h-9 rounded-lg hover:bg-bg-alt flex items-center justify-center transition-colors">
          <Search className="w-4 h-4 text-muted" />
        </button>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-lg hover:bg-bg-alt flex items-center justify-center transition-colors relative">
          <Bell className="w-4 h-4 text-muted" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red rounded-full" />
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          {mounted && isAuthenticated && user ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-alt transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-ink max-w-[80px] truncate">
                  {user.name}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl shadow-xl border border-border overflow-hidden animate-slide-down z-50">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-semibold text-ink truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/dashboard"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-bg-alt rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Kembali ke Site
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red hover:bg-red/5 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
