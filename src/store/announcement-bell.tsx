"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  Bell, X, Pin, Clock, ChevronRight, Sparkles, CheckCheck,
  Filter, Inbox, PinOff,
} from "lucide-react";
import { useIsMounted } from "@/lib/use-is-mounted";

interface Announcement {
  id: number;
  title: string;
  title_en?: string | null;
  body: string;
  body_en?: string | null;
  pinned: boolean;
  category: string;
  icon: string;
  bab_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

type FilterMode = "all" | "pinned" | string;

const FILTER_OPTIONS: Array<{ key: FilterMode; label: string; icon: React.ReactNode; match?: (a: Announcement) => boolean }> = [
  { key: "all", label: "Semua", icon: <Inbox className="w-3.5 h-3.5" /> },
  { key: "pinned", label: "Dipin", icon: <Pin className="w-3.5 h-3.5" />, match: (a) => a.pinned },
  { key: "new_feature", label: "Fitur Baru", icon: <Sparkles className="w-3.5 h-3.5" />, match: (a) => a.category === "new_feature" },
  { key: "new_content", label: "Materi Baru", icon: <Sparkles className="w-3.5 h-3.5" />, match: (a) => a.category === "new_content" },
  { key: "maintenance", label: "Maintenance", icon: <Clock className="w-3.5 h-3.5" />, match: (a) => a.category === "maintenance" },
  { key: "urgent", label: "Penting", icon: <Sparkles className="w-3.5 h-3.5" />, match: (a) => a.category === "urgent" },
  { key: "info", label: "Info", icon: <Bell className="w-3.5 h-3.5" />, match: (a) => a.category === "info" },
];

const DISMISSED_KEY = "biolearn-announcement-dismissed";

export function AnnouncementBell() {
  const mounted = useIsMounted();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<FilterMode>("all");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        if (Array.isArray(arr)) setDismissed(new Set(arr));
      }
    } catch {}
  }, []);

  // Fetch + re-poll every 60s
  useEffect(() => {
    if (!mounted) return;
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/announcements?_t=${Date.now()}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(3000),
        });
        const json = await res.json();
        if (alive && json.announcements) setAnnouncements(json.announcements);
      } catch {
        // keep stale
      }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(interval); };
  }, [mounted]);

  // Lock body scroll while drawer open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    // ESC to close
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    // Focus first interactive inside drawer
    setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [open]);

  const markRead = (id: number) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (typeof window !== "undefined") localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const markAllRead = () => {
    const filtered = filteredAnnouncements;
    const allIds = filtered.map((a) => a.id);
    setDismissed((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      if (typeof window !== "undefined") localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const unreadCount = mounted
    ? announcements.filter((a) => !dismissed.has(a.id)).length
    : 0;

  const sorted = useMemo(
    () =>
      [...announcements].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [announcements]
  );

  const filteredAnnouncements = useMemo(() => {
    if (filter === "all") return sorted;
    const opt = FILTER_OPTIONS.find((o) => o.key === filter);
    if (!opt?.match) return sorted;
    return sorted.filter(opt.match);
  }, [sorted, filter]);

  const visibleCount = filteredAnnouncements.length;
  const visibleUnread = filteredAnnouncements.filter((a) => !dismissed.has(a.id)).length;

  return (
    <>
      {/* Bell trigger — animated wrapper */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-full hover:bg-bg-alt transition-all"
        title={unreadCount > 0 ? `${unreadCount} pengumuman baru` : "Pengumuman"}
        aria-label="Pengumuman"
      >
        <div className="relative">
          <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-accent" : "text-ink"}`} />
          {unreadCount > 0 && (
            <>
              {/* subtle pulse ring */}
              <span className="absolute inset-0 -m-1 rounded-full bg-accent/30 animate-ping pointer-events-none" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-rose-600 rounded-full px-1 ring-2 ring-surface">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Backdrop + Side Drawer (more responsive than centred modal — body text
          no longer truncates, mobile has more room because drawer takes 90vw) */}
      {open && (
        <div className="fixed inset-0 z-[100] animate-fade-in">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Pengumuman"
            className="absolute top-0 right-0 h-full w-full sm:w-[420px] md:w-[460px] lg:w-[520px] bg-surface shadow-2xl border-l border-border flex flex-col animate-slide-in-right"
          >
            {/* Header — pinning with gradient */}
            <div className="relative p-4 sm:p-5 border-b border-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-purple-500/5 to-transparent pointer-events-none" />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-md flex-shrink-0">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 ring-2 ring-surface animate-pop-in">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-ink">Pengumuman</h2>
                    <p className="text-xs text-muted truncate">
                      {unreadCount > 0
                        ? <>
                            <span className="font-bold text-accent">{unreadCount}</span> belum dibaca
                            <span className="mx-1">·</span>
                            total {announcements.length}
                          </>
                        : "✨ Semua sudah dibaca"
                      }
                    </p>
                  </div>
                </div>
                <button
                  ref={firstFocusRef}
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-bg-alt text-muted hover:text-ink transition-colors flex-shrink-0"
                  title="Tutup"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs (chips, sticky) */}
            <div className="px-3 sm:px-4 py-2.5 border-b border-border bg-bg-alt/30 sticky top-0 z-[1] backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Filter className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Filter</span>
                <span className="text-[10px] text-muted-2 ml-auto">
                  {visibleCount === 0 ? "tidak ada" : `${visibleCount} hasil · ${visibleUnread} belum dibaca`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_OPTIONS.map((opt) => {
                  const active = filter === opt.key;
                  const count =
                    opt.key === "all"
                      ? announcements.length
                      : announcements.filter(opt.match || (() => false)).length;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setFilter(opt.key)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        active
                          ? "bg-gradient-to-br from-accent to-purple-500 text-white shadow-sm"
                          : "bg-surface border border-border text-muted hover:text-ink hover:border-accent/40"
                      }`}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                      <span className={`text-[9px] font-bold px-1 rounded-full ${
                        active ? "bg-white/25 text-white" : "bg-bg-alt text-muted-2"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body — staggered fade-in cards */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {loading && announcements.length === 0 && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-bg-alt rounded-xl animate-pulse" />
                  ))}
                </div>
              )}
              {!loading && announcements.length === 0 && (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-alt flex items-center justify-center">
                    <Inbox className="w-8 h-8 text-muted opacity-50" />
                  </div>
                  <p className="text-sm font-medium text-muted">Belum ada pengumuman.</p>
                  <p className="text-xs text-muted-2 mt-1">Pantau terus ya — kami akan kabari kamu kalau ada materi baru.</p>
                </div>
              )}
              {!loading && filteredAnnouncements.length === 0 && announcements.length > 0 && (
                <div className="text-center py-12 px-4">
                  <Filter className="w-10 h-10 mx-auto mb-1 text-muted opacity-50" />
                  <p className="text-sm text-muted">Tidak ada pengumuman di filter ini.</p>
                  <button
                    onClick={() => setFilter("all")}
                    className="mt-2 text-xs text-accent hover:underline"
                  >
                    Reset filter →
                  </button>
                </div>
              )}
              {filteredAnnouncements.length > 0 && (
                <ul className="space-y-3">
                  {filteredAnnouncements.map((a, idx) => {
                    const isRead = dismissed.has(a.id);
                    const isExpanded = expandedIds.has(a.id);
                    // Detect if the body is long → show expand toggle
                    const bodyIsLong = (a.body || "").length > 250;
                    return (
                      <li
                        key={a.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                      >
                        <article
                          className={`relative rounded-xl border transition-all overflow-hidden group ${
                            a.pinned
                              ? "border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50"
                              : isRead
                              ? "border-border/80 bg-surface"
                              : "border-accent/30 bg-gradient-to-br from-accent/[0.04] via-accent/[0.02] to-purple-500/[0.02]"
                          }`}
                        >
                          {a.pinned && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
                          )}
                          <div className="p-4">
                            {/* Top row */}
                            <div className="flex items-start gap-3 mb-2">
                              <div className={`relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${
                                a.pinned ? "bg-gradient-to-br from-amber-100 to-orange-100" : "bg-gradient-to-br from-accent/10 to-purple-500/10"
                              }`}>
                                <span>{a.icon}</span>
                                {a.pinned && (
                                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                                    <Pin className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  {a.pinned && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[9px] font-extrabold uppercase shadow-sm">
                                      <Pin className="w-2.5 h-2.5" />
                                      Pin
                                    </span>
                                  )}
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bg-alt text-muted font-semibold uppercase tracking-wider">
                                    {a.category}
                                  </span>
                                  {!isRead && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent text-white font-bold uppercase tracking-wider animate-pulse-slow">
                                      Baru
                                    </span>
                                  )}
                                </div>
                                <h3 className={`font-bold text-sm sm:text-base leading-snug ${isRead ? "text-muted" : "text-ink"}`}>
                                  {a.title}
                                </h3>
                                {a.title_en && (
                                  <p className="text-[11px] text-muted italic mt-0.5 leading-snug">
                                    {a.title_en}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 text-[10px] text-muted mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(a.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            {/* Body — full text, NO truncation. Expand for very long ones via "Show more" */}
                            <div className="relative">
                              <p
                                className={`text-sm whitespace-pre-line leading-relaxed ${
                                  isRead ? "text-muted" : "text-ink"
                                } ${bodyIsLong && !isExpanded ? "max-h-[7.5rem] overflow-hidden" : ""}`}
                              >
                                {a.body}
                              </p>
                              {bodyIsLong && !isExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
                              )}
                              {bodyIsLong && (
                                <button
                                  onClick={() => toggleExpand(a.id)}
                                  className="text-[11px] font-semibold text-accent hover:text-accent-dark mt-1 inline-flex items-center gap-1"
                                >
                                  {isExpanded ? "← Ringkas" : "Lihat selengkapnya →"}
                                </button>
                              )}
                            </div>
                            {/* Actions footer */}
                            <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-border/50">
                              {a.bab_id ? (
                                <a
                                  href={`/bab/${a.bab_id}`}
                                  onClick={() => setOpen(false)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-accent to-purple-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-accent/25 transition-all"
                                >
                                  Buka BAB
                                  <ChevronRight className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-[10px] text-muted opacity-50">— Tanpa BAB terkait —</span>
                              )}
                              <button
                                onClick={() => markRead(a.id)}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isRead
                                    ? "border border-border text-muted hover:text-ink"
                                    : "border border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-white"
                                }`}
                              >
                                {isRead ? "✓ Sudah dibaca" : "Tandai dibaca"}
                              </button>
                            </div>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer (sticky) */}
            <div className="p-3 sm:p-4 border-t border-border bg-bg-alt/30 flex flex-wrap items-center justify-between gap-2 sticky bottom-0">
              <span className="text-xs text-muted">
                {visibleUnread > 0 ? (
                  <>
                    <span className="font-bold text-accent">{visibleUnread}</span> belum dibaca
                    {filter !== "all" && (
                      <span className="text-muted-2 ml-1">di filter ini</span>
                    )}
                  </>
                ) : (
                  <span className="font-medium text-green-600">✨ Bersih!</span>
                )}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={markAllRead}
                  disabled={visibleUnread === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-ink hover:bg-bg-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tandai dibaca
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-br from-accent to-purple-500 text-white hover:shadow-lg hover:shadow-accent/25 transition-all"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
