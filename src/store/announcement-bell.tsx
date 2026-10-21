"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  Bell, X, Pin, Clock, ChevronRight, Sparkles, CheckCheck, Megaphone,
  Trash2, CheckSquare, Square, RotateCcw,
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
const HIDDEN_KEY = "biolearn-announcement-hidden";

const CATEGORY_MAP: Record<string, { id: string; en: string; color: string }> = {
  info: { id: "Info", en: "Info", color: "bg-blue-500/10 text-blue-600" },
  new_content: { id: "Materi Baru", en: "New Content", color: "bg-green-500/10 text-green-600" },
  new_feature: { id: "Fitur Baru", en: "New Feature", color: "bg-purple-500/10 text-purple-600" },
  maintenance: { id: "Pemeliharaan", en: "Maintenance", color: "bg-gray-500/10 text-gray-600" },
  urgent: { id: "Penting", en: "Urgent", color: "bg-rose-500/10 text-rose-600" },
};

export function AnnouncementBell() {
  const mounted = useIsMounted();
  const { lang, t } = useLangStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const wrapRef = useRef<HTMLDivElement>(null);

  // Load read & hidden state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawDismissed = window.localStorage.getItem(DISMISSED_KEY);
      if (rawDismissed) {
        const arr = JSON.parse(rawDismissed) as number[];
        if (Array.isArray(arr)) setDismissed(new Set(arr));
      }
    } catch {}

    try {
      const rawHidden = window.localStorage.getItem(HIDDEN_KEY);
      if (rawHidden) {
        const arr = JSON.parse(rawHidden) as number[];
        if (Array.isArray(arr)) setHidden(new Set(arr));
      }
    } catch {}
  }, []);

  // Fetch announcements
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
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [mounted]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsSelecting(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setIsSelecting(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  // Mark single as read
  const markRead = (id: number) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  // Mark all as read
  const markAllRead = () => {
    const allIds = announcements.map((a) => a.id);
    setDismissed((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      try {
        window.localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  // Delete / hide single announcement
  const hideOne = (id: number) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Delete / hide multiple announcements
  const hideMultiple = (ids: number[]) => {
    setHidden((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      try {
        window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
    setSelectedIds(new Set());
    setIsSelecting(false);
  };

  // Delete all read announcements
  const hideAllRead = () => {
    const readIds = sorted
      .filter((a) => !hidden.has(a.id) && dismissed.has(a.id))
      .map((a) => a.id);
    if (readIds.length === 0) return;
    hideMultiple(readIds);
  };

  // Restore all hidden announcements
  const restoreHidden = () => {
    setHidden(new Set());
    try {
      window.localStorage.removeItem(HIDDEN_KEY);
    } catch {}
  };

  // Toggle selection for bulk deletion
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all read announcements
  const selectAllRead = () => {
    const readIds = sorted
      .filter((a) => !hidden.has(a.id) && dismissed.has(a.id))
      .map((a) => a.id);
    setSelectedIds(new Set(readIds));
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString(lang === "en" ? "en-US" : "id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pick = (a: Announcement, key: "title" | "body"): string => {
    if (lang === "en") {
      const en = a[`${key}_en` as const];
      if (en && en.trim()) return en;
    }
    return a[key];
  };

  // Sorted: newest at top (created_at DESC, id DESC)
  const sorted = useMemo(
    () =>
      [...announcements].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      }),
    [announcements]
  );

  // Filter out hidden/deleted announcements
  const visibleAnnouncements = useMemo(
    () => sorted.filter((a) => !hidden.has(a.id)),
    [sorted, hidden]
  );

  const unreadCount = mounted
    ? visibleAnnouncements.filter((a) => !dismissed.has(a.id)).length
    : 0;

  const readCount = mounted
    ? visibleAnnouncements.filter((a) => dismissed.has(a.id)).length
    : 0;

  return (
    <div ref={wrapRef} className="relative">
      {/* Bell Trigger Button */}
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

      {/* Pop-up Panel */}
      {open && (
        <div className="fixed top-16 left-3 right-3 sm:absolute sm:left-auto sm:right-0 sm:mt-2 sm:w-[360px] z-50 animate-slide-down origin-top sm:origin-top-right">
          <div className="w-full sm:w-[360px] bg-surface rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col">
            {/* Header */}
            <div className="relative px-4 py-3.5 bg-gradient-to-r from-accent via-purple-500 to-pink-500 text-white overflow-hidden">
              <span className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                    <Megaphone className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm leading-tight">{t("ann.title")}</h3>
                    {unreadCount > 0 ? (
                      <p className="text-[10px] text-white/90 font-medium">
                        {t("ann.unread_count").replace("{count}", String(unreadCount))}
                      </p>
                    ) : (
                      <p className="text-[10px] text-white/80 font-medium">Semua pengumuman</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Select Mode Toggle */}
                  {visibleAnnouncements.length > 0 && (
                    <button
                      onClick={() => {
                        setIsSelecting(!isSelecting);
                        setSelectedIds(new Set());
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        isSelecting
                          ? "bg-white text-accent shadow-xs"
                          : "bg-white/15 hover:bg-white/25 text-white"
                      }`}
                      title={isSelecting ? "Batal mode pilih" : "Pilih pengumuman untuk dihapus"}
                    >
                      {isSelecting ? "Batal" : "Pilih"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setOpen(false);
                      setIsSelecting(false);
                    }}
                    className="p-1 rounded-md hover:bg-white/20 text-white transition-colors"
                    aria-label={t("ann.close")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar when in Selecting Mode */}
            {isSelecting ? (
              <div className="px-4 py-2 border-b border-border bg-purple-50/70 flex items-center justify-between gap-2">
                <button
                  onClick={selectAllRead}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Pilih yg sudah dibaca ({readCount})
                </button>

                <button
                  onClick={() => hideMultiple([...selectedIds])}
                  disabled={selectedIds.size === 0}
                  className="text-xs font-bold px-2.5 py-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-lg inline-flex items-center gap-1 transition-all shadow-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus ({selectedIds.size})
                </button>
              </div>
            ) : (
              /* Normal Subheader Toolbar */
              visibleAnnouncements.length > 0 && (
                <div className="px-4 py-1.5 border-b border-border bg-bg-alt/40 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 ? (
                      <button
                        onClick={markAllRead}
                        className="font-semibold text-accent hover:text-accent-dark inline-flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="w-3 h-3" /> {t("ann.mark_all_read")}
                      </button>
                    ) : (
                      <span className="text-muted font-medium">Semua sudah dibaca</span>
                    )}
                  </div>

                  {readCount > 0 && (
                    <button
                      onClick={hideAllRead}
                      className="text-muted hover:text-rose-600 font-semibold inline-flex items-center gap-1 transition-colors"
                      title="Hapus semua pengumuman yang sudah dibaca dari daftar"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus yang dibaca ({readCount})
                    </button>
                  )}
                </div>
              )
            )}

            {/* Announcements List */}
            <div className="max-h-[50vh] sm:max-h-[420px] overflow-y-auto">
              {visibleAnnouncements.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-muted opacity-30" />
                  <p className="text-sm font-semibold text-ink">Semua pengumuman bersih</p>
                  <p className="text-xs text-muted max-w-xs mx-auto">
                    Tidak ada pengumuman baru atau pengumuman yang belum Anda hapus.
                  </p>
                  {hidden.size > 0 && (
                    <button
                      onClick={restoreHidden}
                      className="mt-2 text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Pulihkan {hidden.size} pengumuman yang dihapus
                    </button>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-border/70">
                  {visibleAnnouncements.map((a, idx) => {
                    const isRead = dismissed.has(a.id);
                    const isSelected = selectedIds.has(a.id);

                    return (
                      <li
                        key={a.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${idx * 30}ms`, animationFillMode: "both" }}
                      >
                        <div
                          className={`relative px-4 py-3 transition-colors ${
                            isSelected
                              ? "bg-purple-100/60 dark:bg-purple-950/40"
                              : isRead
                              ? "bg-bg-alt/50 opacity-75 hover:opacity-100 hover:bg-bg-alt"
                              : "bg-accent/[0.04] hover:bg-accent/[0.07]"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Checkbox when in Selection Mode */}
                            {isSelecting ? (
                              <button
                                type="button"
                                onClick={() => toggleSelect(a.id)}
                                className="mt-1 text-accent flex-shrink-0"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-accent fill-accent/20" />
                                ) : (
                                  <Square className="w-4 h-4 text-muted hover:text-ink" />
                                )}
                              </button>
                            ) : null}

                            {/* Icon */}
                            <div
                              className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-xs transition-colors ${
                                isRead
                                  ? "bg-bg-alt text-muted"
                                  : "bg-gradient-to-br from-accent/20 to-blue-500/20 text-ink"
                              }`}
                            >
                              <span className={isRead ? "grayscale" : ""}>{a.icon}</span>
                              {a.pinned && (
                                <Pin className="absolute -top-1 -right-1 w-3 h-3 text-amber-600 bg-white rounded-full p-0.5 ring-1 ring-amber-200" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1 flex-wrap">
                                {!isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                )}
                                {(() => {
                                  const catInfo = CATEGORY_MAP[a.category];
                                  const catLabel = catInfo
                                    ? lang === "en"
                                      ? catInfo.en
                                      : catInfo.id
                                    : a.category.replace(/_/g, " ");
                                  return (
                                    <span
                                      className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded ${
                                        catInfo
                                          ? catInfo.color
                                          : isRead
                                          ? "text-muted/70"
                                          : "text-muted"
                                      }`}
                                    >
                                      {catLabel}
                                    </span>
                                  );
                                })()}
                                {a.created_at && (
                                  <>
                                    <span className="text-muted/70">·</span>
                                    <span
                                      className={`text-[10px] inline-flex items-center gap-0.5 ${
                                        isRead ? "text-muted/70" : "text-muted"
                                      }`}
                                    >
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatDate(a.created_at)}
                                    </span>
                                  </>
                                )}
                              </div>

                              <h4
                                className={`font-semibold text-[13px] leading-snug ${
                                  isRead ? "text-muted/80" : "text-ink"
                                }`}
                              >
                                {pick(a, "title")}
                              </h4>

                              <p
                                className={`mt-1 text-[12.5px] leading-relaxed whitespace-pre-line break-words ${
                                  isRead ? "text-muted/80" : "text-ink"
                                }`}
                              >
                                {pick(a, "body")}
                              </p>

                              {/* Card Actions */}
                              <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-border/40 gap-2">
                                <div>
                                  {a.bab_id ? (
                                    <a
                                      href={`/bab/${a.bab_id}`}
                                      onClick={() => setOpen(false)}
                                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-accent hover:text-accent-dark transition-colors"
                                    >
                                      {t("ann.open_chapter")} <ChevronRight className="w-3 h-3" />
                                    </a>
                                  ) : null}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Mark Read Button */}
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

                                  {/* Delete single read announcement */}
                                  {isRead && (
                                    <button
                                      onClick={() => hideOne(a.id)}
                                      className="text-[11px] font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1 transition-colors"
                                      title="Hapus pengumuman ini dari daftar Anda"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Hapus
                                    </button>
                                  )}
                                </div>
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

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border bg-gradient-to-r from-pink-500/10 to-purple-500/10 flex items-center justify-between">
              <div>
                {hidden.size > 0 ? (
                  <button
                    onClick={restoreHidden}
                    className="text-[10.5px] font-semibold text-muted hover:text-accent inline-flex items-center gap-1 transition-colors"
                    title="Pulihkan pengumuman yang sebelumnya Anda hapus"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Pulihkan ({hidden.size}) terhapus
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-accent-dark inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {unreadCount > 0 ? (
                      <>{t("ann.unread_count").replace("{count}", String(unreadCount))}</>
                    ) : (
                      <span className="text-green-700 font-semibold">✓ {t("ann.all_clear")}</span>
                    )}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  setIsSelecting(false);
                }}
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
