"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  Bell, X, Pin, Clock, ChevronRight, Sparkles, CheckCheck, Megaphone,
} from "lucide-react";
import { useIsMounted } from "@/lib/use-is-mounted";
import { useLangStore } from "@/lib/lang-store";

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

export function AnnouncementBell() {
  const mounted = useIsMounted();
  const { lang, t } = useLangStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DISMISSED_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        if (Array.isArray(arr)) setDismissed(new Set(arr));
      }
    } catch {}
  }, []);

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
      } catch {}
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(interval); };
  }, [mounted]);

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
    return new Date(iso).toLocaleString(lang === "en" ? "en-US" : "id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

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
      <button
        onClick={() => setOpen(!open)}
        aria-label={t("ann.title")}
        title={unreadCount > 0 ? `${unreadCount} ${t("ann.unread")}` : t("ann.title")}
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

      {open && (
        <div className="fixed top-16 left-3 right-3 sm:absolute sm:left-auto sm:right-0 sm:mt-2 sm:w-[340px] z-50 animate-slide-down origin-top sm:origin-top-right">
          <div className="w-full sm:w-[340px] bg-surface rounded-xl shadow-lg border border-border overflow-hidden flex flex-col">
            <div className="relative px-4 py-3.5 bg-gradient-to-r from-accent via-purple-500 to-pink-500 text-white overflow-hidden">
              <span className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm leading-tight">{t("ann.title")}</h3>
                    {unreadCount > 0 && (
                      <p className="text-[10px] text-white/90 font-medium">{t("ann.unread_count").replace("{count}", String(unreadCount))}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-md hover:bg-white/20 text-white transition-colors flex-shrink-0"
                  aria-label={t("ann.close")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {unreadCount > 0 && sorted.length > 0 && (
              <div className="px-4 py-1.5 border-b border-border bg-bg-alt/40 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted">{t("ann.new_count").replace("{count}", String(unreadCount))}</span>
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-accent hover:text-accent-dark inline-flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" /> {t("ann.mark_all_read")}
                </button>
              </div>
            )}

            <div className="max-h-[50vh] sm:max-h-[420px] overflow-y-auto">
              {sorted.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-7 h-7 mx-auto text-muted opacity-40 mb-2" />
                  <p className="text-sm text-muted font-medium">{t("ann.empty")}</p>
                  <p className="text-xs text-muted mt-1">{t("ann.empty_desc")}</p>
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
                          className={`relative px-4 py-3 transition-colors ${
                            isRead
                              ? "bg-bg-alt/50 opacity-60 hover:opacity-90 hover:bg-bg-alt"
                              : "bg-accent/[0.04] hover:bg-accent/[0.07]"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm transition-colors ${
                              isRead
                                ? "bg-bg-alt text-muted"
                                : "bg-gradient-to-br from-accent/20 to-blue-500/20 text-ink"
                            }`}>
                              <span className={isRead ? "grayscale" : ""}>{a.icon}</span>
                              {a.pinned && (
                                <Pin className="absolute -top-1 -right-1 w-3 h-3 text-amber-600 bg-white rounded-full p-0.5 ring-1 ring-amber-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1 flex-wrap">
                                {!isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                )}
                                <span className={`text-[9.5px] font-medium uppercase tracking-wider ${
                                  isRead ? "text-muted/70" : "text-muted"
                                }`}>
                                  {a.category}
                                </span>
                                {a.created_at && (
                                  <>
                                    <span className="text-muted/70">·</span>
                                    <span className={`text-[10px] inline-flex items-center gap-0.5 ${
                                      isRead ? "text-muted/70" : "text-muted"
                                    }`}>
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatDate(a.created_at)}
                                    </span>
                                  </>
                                )}
                              </div>
                              <h4 className={`font-semibold text-[13px] leading-snug ${
                                isRead ? "text-muted/80" : "text-ink"
                              }`}>
                                {pick(a, "title")}
                              </h4>
                              <p className={`mt-1 text-[12.5px] leading-relaxed whitespace-pre-line break-words ${
                                isRead ? "text-muted/80" : "text-ink"
                              }`}>
                                {pick(a, "body")}
                              </p>
                              <div className="flex items-center justify-between mt-2 gap-2">
                                {a.bab_id ? (
                                  <a
                                    href={`/bab/${a.bab_id}`}
                                    onClick={() => setOpen(false)}
                                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold transition-colors ${
                                      isRead ? "text-muted/80 hover:text-accent" : "text-accent hover:text-accent-dark"
                                    }`}
                                  >
                                    {t("ann.open_chapter")} <ChevronRight className="w-3 h-3" />
                                  </a>
                                ) : <span />}
                                <button
                                  onClick={() => markRead(a.id)}
                                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
                                    isRead
                                      ? "text-muted/70"
                                      : "text-accent hover:bg-accent hover:text-white"
                                  }`}
                                >
                                  {isRead ? `✓ ${t("ann.marked_read")}` : t("ann.mark_read")}
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

            <div className="px-4 py-2 border-t border-border bg-gradient-to-r from-pink-500/15 to-purple-500/15 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-accent-dark inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {unreadCount > 0 ? (
                  <>{t("ann.unread_count").replace("{count}", String(unreadCount))}</>
                ) : (
                  <span className="text-green-700">✓ {t("ann.all_clear")}</span>
                )}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-[11px] font-semibold text-muted hover:text-ink transition-colors"
              >
                {t("ann.done")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
