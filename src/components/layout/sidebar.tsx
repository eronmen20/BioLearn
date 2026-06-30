"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLangStore } from "@/lib/lang-store";
import { BAB, KELAS } from "@/lib/bab-data";
import {
  Home,
  BookOpen,
  TrendingUp,
  X,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

export function Sidebar() {
  const { t } = useLangStore();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const closeSidebar = () => {
    if (inputRef.current) inputRef.current.checked = false;
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };

    document.addEventListener("keydown", handleEsc);

    return () =>
      document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  return (
    <>
      <input
        type="checkbox"
        id="sidebar-toggle"
        className="hidden peer"
        ref={inputRef}
      />

      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 bg-black/40 z-30 hidden peer-checked:block md:hidden backdrop-blur-sm"
      />

      <nav className="fixed top-16 left-0 bottom-0 w-[280px] sm:w-[260px] bg-surface border-r border-border/50 overflow-y-auto z-30 transition-transform duration-300 -translate-x-full md:translate-x-0 peer-checked:translate-x-0 shadow-lg md:shadow-none">

        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2 md:hidden">
          <span className="text-sm font-bold text-muted">
            {t("sidebar.menu")}
          </span>

          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-bg-alt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Menu */}
        <div className="px-4 pt-1 md:pt-5 pb-2">

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
                      />
                    );

                  })}

                </div>
              )}

            </div>
          ))}

        </div>

      </nav>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
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

      <span>{label}</span>
    </Link>
  );
}