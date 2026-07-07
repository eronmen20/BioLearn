"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Layers,
  HelpCircle,
  FlaskConical,
  Image,
  Users,
  GraduationCap,
  Shield,
  TrendingUp,
  Award,
  ClipboardList,
  Megaphone,
  Globe,
  BarChart3,
  PieChart,
  Activity,
  Wifi,
  Bot,
  ScrollText,
  Cpu,
  Settings,
  Palette,
  Lock,
  Database,
  Download,
  Server,
  Sparkles,
  ChevronRight,
  X,
  ChevronDown,
  FileQuestion,
} from "lucide-react";

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const MENU_GROUPS: MenuGroup[] = [
  {
    label: "Dashboard",
    items: [
      { href: "/admin", icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: "Overview" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/content/kelas", icon: <Layers className="w-[18px] h-[18px]" />, label: "Kelas" },
      { href: "/admin/content/bab", icon: <BookOpen className="w-[18px] h-[18px]" />, label: "Bab" },
      { href: "/admin/content/materi-biologi", icon: <FileText className="w-[18px] h-[18px]" />, label: "Materi Biologi" },
      { href: "/admin/content/materi-editor", icon: <Sparkles className="w-[18px] h-[18px]" />, label: "Editor Materi" },
      { href: "/admin/content/quiz-v2", icon: <FileQuestion className="w-[18px] h-[18px]" />, label: "Quiz" },
      { href: "/admin/content/struktur", icon: <FlaskConical className="w-[18px] h-[18px]" />, label: "Struktur & Fungsi" },
      { href: "/admin/content/praktikum", icon: <FlaskConical className="w-[18px] h-[18px]" />, label: "Praktikum" },
      { href: "/admin/content/media", icon: <Image className="w-[18px] h-[18px]" />, label: "Media" },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/admin/users/siswa", icon: <Users className="w-[18px] h-[18px]" />, label: "Siswa" },
      { href: "/admin/users/guru", icon: <GraduationCap className="w-[18px] h-[18px]" />, label: "Guru" },
      { href: "/admin/users/admin", icon: <Shield className="w-[18px] h-[18px]" />, label: "Admin" },
    ],
  },
  {
    label: "Learning",
    items: [
      { href: "/admin/learning/progress", icon: <TrendingUp className="w-[18px] h-[18px]" />, label: "Progress Belajar" },
      { href: "/admin/learning/nilai", icon: <Award className="w-[18px] h-[18px]" />, label: "Nilai" },
      { href: "/admin/learning/riwayat-quiz", icon: <ClipboardList className="w-[18px] h-[18px]" />, label: "Riwayat Quiz" },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/website/banner", icon: <Megaphone className="w-[18px] h-[18px]" />, label: "Banner" },
      { href: "/admin/website/pengumuman", icon: <ScrollText className="w-[18px] h-[18px]" />, label: "Pengumuman" },
      { href: "/admin/website/homepage", icon: <Globe className="w-[18px] h-[18px]" />, label: "Homepage" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/admin/analytics/users", icon: <BarChart3 className="w-[18px] h-[18px]" />, label: "Statistik User" },
      { href: "/admin/analytics/materi", icon: <PieChart className="w-[18px] h-[18px]" />, label: "Statistik Materi" },
      { href: "/admin/analytics/quiz", icon: <Activity className="w-[18px] h-[18px]" />, label: "Statistik Quiz" },
      { href: "/admin/analytics/traffic", icon: <Wifi className="w-[18px] h-[18px]" />, label: "Traffic" },
    ],
  },
  {
    label: "AI",
    items: [
      { href: "/admin/ai/prompts", icon: <Bot className="w-[18px] h-[18px]" />, label: "Prompt Management" },
      { href: "/admin/ai/logs", icon: <ScrollText className="w-[18px] h-[18px]" />, label: "AI Logs" },
      { href: "/admin/ai/usage", icon: <Cpu className="w-[18px] h-[18px]" />, label: "AI Usage" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/settings/general", icon: <Settings className="w-[18px] h-[18px]" />, label: "General" },
      { href: "/admin/settings/theme", icon: <Palette className="w-[18px] h-[18px]" />, label: "Theme" },
      { href: "/admin/settings/security", icon: <Lock className="w-[18px] h-[18px]" />, label: "Security" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/system/logs", icon: <Database className="w-[18px] h-[18px]" />, label: "Activity Logs" },
      { href: "/admin/system/backup", icon: <Download className="w-[18px] h-[18px]" />, label: "Backup" },
      { href: "/admin/system/database", icon: <Server className="w-[18px] h-[18px]" />, label: "Database" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const closeSidebar = () => {
    if (inputRef.current) inputRef.current.checked = false;
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  // Auto-expand active group
  useEffect(() => {
    for (const group of MENU_GROUPS) {
      const isActive = group.items.some((item) => {
        if (item.href === "/admin") return pathname === "/admin";
        return pathname.startsWith(item.href);
      });
      if (isActive) {
        setOpenGroups((prev) => ({ ...prev, [group.label]: true }));
      }
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <input
        type="checkbox"
        id="admin-sidebar-toggle"
        className="hidden peer"
        ref={inputRef}
      />

      <label
        htmlFor="admin-sidebar-toggle"
        className="fixed inset-0 bg-black/40 z-30 hidden peer-checked:block lg:hidden backdrop-blur-sm"
      />

      <aside className="fixed top-14 left-0 bottom-0 w-[260px] bg-surface border-r border-border/50 overflow-y-auto z-30 transition-transform duration-300 -translate-x-full lg:translate-x-0 peer-checked:translate-x-0 shadow-lg lg:shadow-none">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 lg:hidden">
          <span className="text-sm font-bold text-muted">Menu Admin</span>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-bg-alt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 pt-3 lg:pt-4 pb-6">
          {MENU_GROUPS.map((group) => {
            const isGroupOpen = openGroups[group.label] ?? (group.label === "Dashboard");

            return (
              <div key={group.label} className="mb-1">
                {group.items.length === 1 ? (
                  <Link
                    href={group.items[0].href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-0.5 ${
                      isActive(group.items[0].href)
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-muted hover:bg-bg-alt hover:text-ink"
                    }`}
                  >
                    <span className="w-5 flex justify-center">
                      {group.items[0].icon}
                    </span>
                    <span>{group.items[0].label}</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-muted-2 uppercase tracking-wider hover:bg-bg-alt transition"
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isGroupOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isGroupOpen && (
                      <div className="ml-1 mt-0.5 mb-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all mb-0.5 ${
                              isActive(item.href)
                                ? "bg-accent/10 text-accent font-semibold"
                                : "text-muted hover:bg-bg-alt hover:text-ink"
                            }`}
                          >
                            <span className="w-5 flex justify-center">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
