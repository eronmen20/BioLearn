'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Pin, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { useLangStore } from '@/lib/lang-store';
import { useIsMounted } from '@/lib/use-is-mounted';

interface Announcement {
  id: number;
  title: string;
  body: string;
  pinned: boolean;
  category: string;
  icon: string;
  bab_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const DISMISSED_KEY = 'biolearn-announcement-dismissed';

export function AnnouncementBell() {
  const { t } = useLangStore();
  const mounted = useIsMounted();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  // Load dismissed list from localStorage (after mount to avoid hydration mismatch)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        if (Array.isArray(arr)) setDismissed(new Set(arr));
      }
    } catch {}
  }, []);

  // Load announcements — once on mount, then poll every 60s for live updates
  useEffect(() => {
    if (!mounted) return;
    let alive = true;
    const load = async () => {
      try {
        // cache:no-store belt-and-braces + ts cache-buster to force fresh
        const res = await fetch(`/api/announcements?_t=${Date.now()}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(3000),
        });
        const json = await res.json();
        if (alive && json.announcements) setAnnouncements(json.announcements);
      } catch {
        // soft fail — keeping stale list
      }
    };
    load();
    const interval = setInterval(load, 60_000); // re-poll every 60s
    return () => { alive = false; clearInterval(interval); };
  }, [mounted]);

  // Unread = announcements not yet dismissed
  const unreadCount = mounted
    ? announcements.filter((a) => !dismissed.has(a.id)).length
    : 0;

  const markRead = (id: number) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      }
      return next;
    });
  };

  const markAllRead = () => {
    const allIds = announcements.map((a) => a.id);
    setDismissed(new Set(allIds));
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(allIds));
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const visibleAnnouncements = (mounted ? announcements : []).filter((a) => !dismissed.has(a.id));

  return (
    <>
      {/* Bell button in header */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-full hover:bg-bg-alt transition-colors"
        title={unreadCount > 0 ? `${unreadCount} pengumuman baru` : 'Pengumuman'}
        aria-label="Pengumuman"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-accent animate-pulse-slow' : 'text-ink'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 ring-2 ring-surface animate-pop-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div
            className="relative bg-surface rounded-2xl shadow-2xl border border-border max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-border bg-gradient-to-br from-accent/5 via-surface to-surface">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-ink">Pengumuman</h2>
                  <p className="text-xs text-muted">
                    {visibleAnnouncements.length > 0
                      ? `${unreadCount} belum dibaca · total ${announcements.length}`
                      : `Semua pengumuman sudah dibaca`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-bg-alt text-muted hover:text-ink transition-colors flex-shrink-0"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
              {loading && (
                <div className="animate-pulse space-y-3">
                  <div className="h-20 bg-bg-alt rounded-xl" />
                  <div className="h-20 bg-bg-alt rounded-xl" />
                </div>
              )}
              {!loading && announcements.length === 0 && (
                <div className="text-center py-12 text-muted">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Belum ada pengumuman.</p>
                </div>
              )}
              {!loading && announcements
                .sort((a, b) => {
                  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
                .map((a) => {
                  const isRead = dismissed.has(a.id);
                  return (
                    <div
                      key={a.id}
                      className={`group relative rounded-xl border transition-all ${
                        isRead ? 'border-border/70 bg-surface/50' : 'border-accent/30 bg-accent/[0.04] hover:bg-accent/[0.07]'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-2xl flex-shrink-0">{a.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {a.pinned && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[10px] font-semibold">
                                  <Pin className="w-3 h-3" />
                                  PIN
                                </span>
                              )}
                              <h3 className={`font-semibold text-sm ${isRead ? 'text-muted' : 'text-ink'}`}>
                                {a.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted mb-2">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(a.created_at)}
                              </span>
                            </div>
                            <p className={`text-sm whitespace-pre-line leading-relaxed ${isRead ? 'text-muted' : 'text-ink'}`}>
                              {a.body}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                          {a.bab_id && (
                            <a
                              href={`/bab/${a.bab_id}`}
                              onClick={() => setOpen(false)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-colors"
                            >
                              Buka BAB terkait
                              <ChevronRight className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => markRead(a.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isRead
                                ? 'border border-border text-muted hover:text-ink'
                                : 'border border-accent/40 text-accent hover:bg-accent/10'
                            }`}
                          >
                            {isRead ? '✓ Dibaca' : 'Tandai dibaca'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-border bg-bg-alt/30 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted">
                {visibleAnnouncements.length > 0 ? `${visibleAnnouncements.length} belum dibaca` : '✨ Semua sudah dibaca!'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={markAllRead}
                  disabled={visibleAnnouncements.length === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-alt text-ink hover:bg-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Tandai semua dibaca
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-dark transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
