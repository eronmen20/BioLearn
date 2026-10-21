"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLangStore } from "@/lib/lang-store";
import { BAB, KELAS } from "@/lib/bab-data";
import { useBabArchiveIds, ALWAYS_VISIBLE_BABS } from "@/store/use-bab-archive";
import { useSidebarStore } from "@/lib/sidebar-store";
import { useAuthStore } from "@/lib/auth-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import {
  Home,
  BookOpen,
  TrendingUp,
  Newspaper,
  FlaskConical,
  X,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

export function Sidebar() {
  const { t } = useLangStore();
  const pathname = usePathname();
  const { open, mobileOpen, setOpen, setMobileOpen } = useSidebarStore();
  const { archivedIds, loaded: archiveLoaded } = useBabArchiveIds();
  const { isAuthenticated } = useAuthStore();
  const mounted = useIsMounted();
  const isGuest = mounted && !isAuthenticated;
  // Conservative visible set:
  //   - Before mounted: only ALWAYS_VISIBLE_BABS (whitelist, default = ["bakteri"])
  //   - After mounted: only babs in ALL_VISIBLE that are NOT in archivedIds
  // This prevents FOUC and is safe even if SQL migration hasn't been run.
  const visibleBabIds: Set<string> = (() => {
    if (!archiveLoaded) return new Set(ALWAYS_VISIBLE_BABS);
    const out = new Set<string>();
    for (const id of ALWAYS_VISIBLE_BABS) {
      if (!archivedIds.has(id)) out.add(id);
    }
    return out;
  })();

  // buka kelas sesuai halaman aktif
  const getInitialOpenClass = () => {
    const currentBab = pathname.replace("/bab/", "");

    const found = KELAS.find((k) =>
      k.materi.includes(currentBab)
    );

    return found?.id ?? "x";
  };

  const [openClass, setOpenClass] = useState(getInitialOpenClass());

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const closeMobileSidebar = useCallback(() => setMobileOpen(false), [setMobileOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileSidebar();
    };

    document.addEventListener("keydown", handleEsc);

    return () =>
      document.removeEventListener("keydown", handleEsc);
  }, [closeMobileSidebar]);

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  return (
    <>
      {/* Backdrop (mobile only) */}
      <button
        type="button"
        aria-label={t("sidebar.menu")}
        onClick={closeMobileSidebar}
        className={`fixed inset-0 bg-black/40 z-30 backdrop-blur-sm md:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
      />

      <nav
        className={`fixed top-16 left-0 bottom-0 w-[280px] sm:w-[260px] bg-surface border-r border-border/50 overflow-y-auto z-30 transition-transform duration-300 shadow-lg md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${open ? "md:translate-x-0" : "md:-translate-x-full"}`}
      >

        {/* Desktop close — sidebar tetap bisa ditutup walau window fullscreen */}
        <div className="hidden md:flex items-center justify-end px-3 pt-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-bg-alt text-muted hover:text-ink transition-colors"
            title="Tutup sidebar"
            aria-label="Tutup sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2 md:hidden">
          <span className="text-sm font-bold text-muted">
            {t("sidebar.menu")}
          </span>

          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label={t("sidebar.menu")}
            className="p-2 rounded-lg hover:bg-bg-alt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Menu */}
        <div className="px-4 pt-1 pb-2">

          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-2 mb-1">
            {t("sidebar.menu")}
          </p>

          <NavItem
            href="/dashboard"
            icon={<Home className="w-5 h-5" />}
            label={t("sidebar.dashboard")}
            active={pathname === "/dashboard"}
          />

          <NavItem
            href="/glossary"
            icon={<BookOpen className="w-5 h-5" />}
            label={t("sidebar.glossary")}
            active={pathname.startsWith("/glossary")}
          />

          <NavItem
            href="/progress"
            icon={<TrendingUp className="w-5 h-5" />}
            label={t("sidebar.progress")}
            active={pathname.startsWith("/progress")}
          />

          <NavItem
            href="/bionow"
            icon={<Newspaper className="w-5 h-5" />}
            label={t("sidebar.bionow")}
            active={pathname.startsWith("/bionow")}
          />

          <NavItem
            href="/biolab"
            icon={<FlaskConical className="w-5 h-5" />}
            label={t("sidebar.biolab")}
            active={pathname.startsWith("/biolab")}
          />

        </div>

        <div className="mx-4 my-3 border-t border-border/50" />

        {/* Materi */}
        <div className="px-4 pb-8">

          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-2 mb-2">
            {t("sidebar.materi")}
          </p>

          {KELAS.map((kelas) => (
            <div key={kelas.id} className="mb-2">

              <button
                onClick={() =>
                  setOpenClass(
                    openClass === kelas.id ? "" : kelas.id
                  )
                }
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-bg-alt transition group"
              >
                <span className="text-sm font-medium text-muted group-hover:text-ink transition-colors flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  {t(`sidebar.kelas.${kelas.id}`)}
                </span>

                <ChevronRight
                  className={`w-4 h-4 transition-transform text-muted group-hover:text-ink ${
                    openClass === kelas.id
                      ? "rotate-90"
                      : ""
                  }`}
                />
              </button>

              {openClass === kelas.id && (
                <div className="ml-4 mt-1">

                  {kelas.materi.map((materiId) => {

                    const bab = BAB.find(
                      (b) => b.id === materiId
                    );

                    if (!bab) return null;
                    // Hide bab outside permanent visible whitelist
                    if (!visibleBabIds.has(bab.id)) return null;

                    const isFreeHook = bab.id === "bakteri" && isGuest;

                    return (
                      <NavItem
                        key={bab.id}
                        href={`/bab/${bab.id}`}
                        icon={
                          <span className="text-lg">
                            {bab.icon}
                          </span>
                        }
                        label={t(`bab.${bab.id}`)}
                        active={pathname === `/bab/${bab.id}`}
                        badge={
                          isFreeHook ? (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-accent bg-accent/15 px-2 py-0.5 rounded-full ml-auto">
                              Free
                            </span>
                          ) : undefined
                        }
                      />
                    );

                  })}

                </div>
              )}

            </div>
          ))}

        </div>

        {/* Guest conversion teaser at bottom of sidebar */}
        {isGuest && (
          <div className="mx-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-accent/15 to-purple-500/10 border border-accent/20 text-center">
            <div className="text-xl mb-1">🧬</div>
            <p className="text-xs font-bold text-ink mb-1">BioLearn Akun Siswa</p>
            <p className="text-[11px] text-muted mb-3 leading-snug">
              Daftar gratis untuk buka semua materi & simpan progres belajarmu.
            </p>
            <Link
              href="/login?mode=register&redirect=/bab/bakteri"
              className="block w-full py-2 bg-accent text-white text-xs font-bold rounded-xl hover:bg-accent-dark transition-colors shadow-sm"
            >
              Daftar Gratis
            </Link>
          </div>
        )}

      </nav>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
        active
          ? "bg-accent/10 text-accent font-semibold"
          : "text-muted hover:bg-bg-alt hover:text-ink"
      }`}
    >
      <span className="w-6 flex justify-center">
        {icon}
      </span>

      <span className="truncate">{label}</span>
      {badge}
    </Link>
  );
}