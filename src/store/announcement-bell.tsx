"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  Bell, X, Pin, Clock, ChevronRight, Sparkles, CheckCheck, Megaphone,
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

const DISMISSED_KEY = "biolearn-announcement-dismissed";
const MAX_HEIGHT = "max-h-[420px]";

export function AnnouncementBell() {
  const mounted = useIsMounted();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [lang, setLang] = useState<"id" | "en">("id");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Read language preference + dismissed list from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("biolearn-lang") as "id" | "en" | null;
      if (stored === "id" || stored === "en") setLang(stored);
    } catch {}
    try {
      const raw = window.localStorage.getItem(DISMISSED_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        if (Array.isArray(arr)) setDismissed(new Set(arr));
      }
    } catch {}
  }, []);

  // Lightweight polling every 60s — only re-fetch if bell is mounted (won't reach SPA
  // tabs the user isn't using, so it's fine)
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
        // keep stale data on transient errors
      }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(interval); };
  }, [mounted]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const markRead = (id: number) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { window.localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const markAllRead = () => {
    const allIds = announcements.map((a) => a.id);
    setDismissed((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      try { window.localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  // Bilingual text helper
  const pick = (a: Announcement, key: "title" | "body"): string => {
    if (lang === "en") {
      const en = a[`${key}_en` as const];
      if (en && en.trim()) return en;
    }
    return a[key];
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

  return (
    <div ref={wrapRef} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Pengumuman"
        title={unreadCount > 0 ? `${unreadCount} pengumuman belum dibaca` : "Pengumuman"}
        className="relative p-2 rounded-full hover:bg-bg-alt transition-all"
      >
        <div className="relative">
          <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-accent" : "text-ink"}`} />
          {unreadCount > 0 && (
            <>
              <span className="absolute inset-0 -m-1 rounded-full bg-accent/30 animate-ping pointer-events-none" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-rose-600 rounded-full px-1 ring-2 ring-surface">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </div>
      </button>

      {/* ▼ Dropdown anchored bawah icon bell. No filter, simple + minimalist. */}
      {open && (
        <div className="absolute top-full right-0 mt-2 z-50 animate-slide-down origin-top-right">
          <div className="w-[300px] sm:w-[340px] bg-surface rounded-xl shadow-lg border border-border overflow-hidden flex flex-col">
            {/* Header — minimalist: solid surface + small accent dot */}
            <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-3.5 h-3.5 text-accent" />
                </div>
                <h3 className="font-semibold text-sm text-ink">Pengumuman</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-bg-alt text-muted hover:text-ink transition-colors flex-shrink-0"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mark-all-read inline (subtle, bukan bagian header biar gak noisy) */}
            {unreadCount > 0 && sorted.length > 0 && (
              <div className="px-4 py-1.5 border-b border-border bg-bg-alt/40">
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-muted hover:text-accent inline-flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" /> Tandai semua sudah dibaca
                </button>
              </div>
            )}

            {/* Body — scroll, NO truncation di body text */}
            <div className={`${MAX_HEIGHT} overflow-y-auto`}>
              {sorted.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-7 h-7 mx-auto text-muted opacity-40 mb-2" />
                  <p className="text-sm text-muted font-medium">Belum ada pengumuman</p>
                  <p className="text-xs text-muted mt-1">Stay tuned — kami akan kabari kamu kalau ada materi baru.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/70">
                  {sorted.map((a, idx) => {
                    const isRead = dismissed.has(a.id);
                    return (
                      <li
                        key={a.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                      >
                        <div
                          className={`relative px-4 py-3 transition-colors hover:bg-bg-alt/40 ${
                            isRead ? "" : "bg-accent/[0.04]"
                          }`}
                        >
                          {/* Pinned marker — small dot, bukan full strip */}
                          <div className="flex items-start gap-2.5">
                            <div className="relative flex-shrink-0 w-8 h-8 rounded-lg bg-bg-alt flex items-center justify-center text-lg">
                              <span>{a.icon}</span>
                              {a.pinned && (
                                <Pin className="absolute -top-1 -right-1 w-3 h-3 text-amber-600 bg-white rounded-full p-0.5 ring-1 ring-amber-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1 flex-wrap">
                                {!isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                )}
                                <span className="text-[9.5px] font-medium uppercase tracking-wider text-muted">
                                  {a.category}
                                </span>
                                {a.created_at && (
                                  <>
                                    <span className="text-muted">·</span>
                                    <span className="text-[10px] text-muted inline-flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatDate(a.created_at)}
                                    </span>
                                  </>
                                )}
                              </div>
                              {/* Title */}
                              <h4 className={`font-semibold text-[13px] leading-snug ${isRead ? "text-muted" : "text-ink"}`}>
                                {pick(a, "title")}
                              </h4>
                              {/* Body — NO truncation, full text */}
                              <p className={`mt-1 text-[12.5px] leading-relaxed whitespace-pre-line break-words ${isRead ? "text-muted" : "text-ink"}`}>
                                {pick(a, "body")}
                              </p>
                              {/* Actions */}
                              <div className="flex items-center justify-between mt-2 gap-2">
                                {a.bab_id ? (
                                  <a
                                    href={`/bab/${a.bab_id}`}
                                    onClick={() => setOpen(false)}
                                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-accent hover:text-accent-dark transition-colors"
                                  >
                                    Buka BAB <ChevronRight className="w-3 h-3" />
                                  </a>
                                ) : <span />}
                                <button
                                  onClick={() => markRead(a.id)}
                                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                                    isRead
                                      ? "text-muted"
                                      : "text-accent hover:bg-accent hover:text-white"
                                  }`}
                                >
                                  {isRead ? "✓ Dibaca" : "Tandai dibaca"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer — tipis, calm */}
            <div className="px-4 py-2 border-t border-border bg-bg-alt/40 flex items-center justify-between">
              <span className="text-[11px] text-muted">
                {unreadCount > 0 ? (
                  <>
                    <span className="font-bold text-accent">{unreadCount}</span> belum dibaca
                  </>
                ) : (
                  <span className="font-medium text-green-600">✓ Semua bersih</span>
                )}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-[11px] font-semibold text-muted hover:text-ink transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
