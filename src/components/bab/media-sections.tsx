"use client";

import { useState, useEffect, type HTMLAttributes } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";
import { StrukturViewer } from "@/components/struktur-viewer";
import { PraktikumViewer } from "@/components/praktikum-viewer";
import { DigestiveInteractiveSection } from "@/components/sections/digestive-interactive";

/* ───────── AnimationSection ───────── */
export function AnimationSection({ babId, color, icon }: { babId: string; color: string; icon: string }) {
  const { t } = useLangStore();

  if (babId === "sel") {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎬</span>
          <h3 className="font-bold text-sm">{t("animasi")}</h3>
        </div>
        <div className="bg-gradient-to-br from-[#e8e5ff] to-[#d4d0ff] rounded-2xl p-8 text-center min-h-[220px] flex flex-col items-center justify-center overflow-hidden shadow-card border border-accent/10">
          <div className="relative w-full max-w-[300px] h-[200px]">
            <div className="absolute left-1/2 top-[10px] w-[6px] h-[180px] bg-gradient-to-b from-transparent via-accent to-transparent animate-dna rounded-full" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-accent-dark text-center">
              {t("dna.label")}
              <br />
              <span className="text-[11px] text-muted">{t("dna.desc")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (babId === "pencernaan") {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎬</span>
        <h3 className="font-bold text-sm">{t("animasi")}</h3>
      </div>
      <div className="rounded-2xl p-8 text-center min-h-[180px] flex flex-col items-center justify-center shadow-card border border-border/50" style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}>
        <div className="text-5xl animate-glow">{icon}</div>
        <div className="text-sm font-semibold text-muted mt-3">{t(`bab.${babId}`)}</div>
      </div>
    </div>
  );
}

/* ───────── HotspotSection ───────── */
export function HotspotSection({ babId, hotspotted }: { babId: string; hotspotted: string }) {
  const { t, lang } = useLangStore();

  if (babId === "pencernaan" || hotspotted === "pencernaan") {
    return <DigestiveInteractiveSection lang={lang} />;
  }

  if (hotspotted === "sel") {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🖼️</span>
          <h3 className="font-bold text-sm">{t("animasi.sel.title")}</h3>
        </div>
        <div className="bg-surface rounded-2xl p-6 shadow-card border border-border/50">
          <div className="text-center text-muted text-sm">
            {t("animasi.sel.desc")}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* ───────── PraktikumSection ───────── */
export function PraktikumSection({ babId, subBabKey, lang }: { babId: string; subBabKey: string | null; lang: "id" | "en" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const url = subBabKey
      ? `/api/praktikum?bab_id=${encodeURIComponent(babId)}&sub_bab_key=${encodeURIComponent(subBabKey)}&_t=${Date.now()}`
      : `/api/praktikum?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`;
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { if (alive) setItems(data.praktikum || []); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [babId, subBabKey]);

  if (loading || items.length === 0) return null;

  return (
    <div className="mb-6 space-y-6">
      {items.map((item) => (
        <div key={item.id} className="bg-surface rounded-2xl shadow-card border border-border/50 p-4 sm:p-6">
          <PraktikumViewer
            title={item.title_id}
            title_en={item.title_en}
            description={item.description_id}
            description_en={item.description_en}
            steps={item.steps || []}
            image_url={item.image_url}
            image_alt={item.image_alt}
            flashcards={item.flashcards || []}
            difficulty={item.difficulty}
            lang={lang}
          />
        </div>
      ))}
    </div>
  );
}

/* ───────── StrukturSection ───────── */
export function StrukturSection({ babId, subBabKey, lang }: { babId: string; subBabKey: string | null; lang: "id" | "en" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const url = subBabKey
      ? `/api/struktur?bab_id=${encodeURIComponent(babId)}&sub_bab_key=${encodeURIComponent(subBabKey)}&_t=${Date.now()}`
      : `/api/struktur?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`;
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { if (alive) setItems(data.struktur || []); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [babId, subBabKey]);

  if (loading || items.length === 0) return null;

  return (
    <div className="mb-6 space-y-6">
      {items.map((item) => (
        <div key={item.id} className="bg-surface rounded-2xl shadow-card border border-border/50 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔬</span>
            <h3 className="font-bold text-sm">Struktur & Fungsi</h3>
          </div>
          <StrukturViewer
            title={item.title}
            title_en={item.title_en}
            image_url={item.image_url}
            image_alt={item.image_alt}
            flashcards={item.flashcards || []}
            lang={lang}
          />
        </div>
      ))}
    </div>
  );
}

/* ───────── InlineAnimationSection ───────── */
export function InlineAnimationSection({
  subKey,
  subMedia,
}: {
  subKey: string;
  subMedia: { video_url: string; image_url: string; animation_url: string; animation_type: string };
}) {
  const { t } = useLangStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!subMedia.animation_url) {
    return null;
  }

  const url = subMedia.animation_url;
  const type = (subMedia.animation_type || "").toLowerCase();
  const looksLikeSvg =
    type === "svg" ||
    /\.svg(\?|#|$)/i.test(url) ||
    /\/svg/i.test(url);

  return (
    <div className={`mb-6 transition-all duration-300 ${isExpanded ? "relative z-20" : ""}`}>
      <AnimationHeader
        t={t}
        typeLabel={resolvedAnimLabel(type, url)}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />
      {type === "iframe" || type === "h5p" ? (
        <FullBleedIframe url={animUrlAsEmbed(url)} title={`Animasi ${subKey}`} />
      ) : type === "gif" ? (
        <SimpleImg
          url={url}
          title={`Animasi ${subKey}`}
          maxHeightClass={isExpanded ? "max-h-[750px]" : "max-h-[480px]"}
        />
      ) : looksLikeSvg ? (
        <SvgWithFallback
          url={url}
          title={`Animasi ${subKey}`}
          subKey={subKey}
          isExpanded={isExpanded}
        />
      ) : (
        <SimpleImg
          url={url}
          title={`Animasi ${subKey}`}
          maxHeightClass={isExpanded ? "max-h-[750px]" : "max-h-[480px]"}
        />
      )}
    </div>
  );
}

function resolvedAnimLabel(type: string, url: string): string {
  if (type) return type;
  if (/\.svg(\?|#|$)/i.test(url)) return "SVG";
  if (/\.gif(\?|#|$)/i.test(url)) return "GIF";
  if (/\.mp4(\?|#|$)/i.test(url)) return "Video";
  return "Media";
}

function FullBleedIframe({ url, title }: { url: string; title: string }) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black shadow-card border border-border/50">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={url}
          title={title}
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
    </div>
  );
}

function SimpleImg({
  url,
  title,
  maxHeightClass,
}: {
  url: string;
  title: string;
  maxHeightClass: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) return <AnimationErrorFallback url={url} title={title} />;
  return (
    <div className="bg-surface rounded-2xl p-4 shadow-card border border-border/50 flex items-center justify-center min-h-[220px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={title}
        className={`${maxHeightClass} rounded-xl object-contain`}
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function SvgWithFallback({
  url,
  title,
  subKey,
  isExpanded,
}: {
  url: string;
  title: string;
  subKey: string;
  isExpanded?: boolean;
}) {
  const [inline, setInline] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [objectFailed, setObjectFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setInline(null);
    setInlineError(null);
    setObjectFailed(false);
    setImgFailed(false);

    (async () => {
      try {
        const isExternal = /^https?:\/\//i.test(url);
        const targetUrl = isExternal ? `/api/media-proxy?url=${encodeURIComponent(url)}` : url;
        const res = await fetch(targetUrl);
        if (!res.ok) {
          const err = (await res.json().catch(() => ({})))?.error || `HTTP ${res.status}`;
          throw new Error(err);
        }
        const text = await res.text();
        if (cancelled) return;
        if (!/<svg[\s\S]*?<\/svg>|<\/svg>|<svg\b[^>]*\/?>/i.test(text)) {
          throw new Error("Response is not SVG markup");
        }
        setInline(text);
      } catch (e) {
        if (!cancelled) setInlineError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  const isExternal = /^https?:\/\//i.test(url);
  const objectUrl = isExternal ? `/api/media-proxy?url=${encodeURIComponent(url)}` : url;

  return (
    <div
      className={`bg-surface rounded-2xl p-2 sm:p-5 shadow-card border border-border/50 flex flex-col items-center justify-center transition-all duration-300 w-full overflow-hidden ${
        isExpanded
          ? "min-h-[500px] sm:min-h-[640px] p-3 sm:p-6 border-accent/40 shadow-xl"
          : "min-h-[380px] sm:min-h-[460px]"
      }`}
    >
      {inline ? (
        <SvgScope
          html={inline}
          aria-label={title}
          className={`w-full flex items-center justify-center transition-all duration-300 [&>svg]:w-full [&>svg]:h-auto [&>svg]:drop-shadow-xs ${
            isExpanded
              ? "max-w-6xl [&>svg]:max-w-6xl [&>svg]:max-h-[820px]"
              : "max-w-4xl [&>svg]:max-w-4xl [&>svg]:max-h-[580px]"
          }`}
        />
      ) : !objectFailed && !inlineError ? (
        <object
          type="image/svg+xml"
          data={objectUrl}
          aria-label={title}
          className={`w-full rounded-xl transition-all duration-300 ${
            isExpanded ? "max-w-6xl h-[680px]" : "max-w-4xl h-[480px]"
          }`}
          onError={() => setObjectFailed(true)}
          ref={(el) => {
            if (el && !el.dataset.scoped) {
              el.dataset.scoped = "1";
              const probe = new Image();
              probe.onerror = () => setObjectFailed(true);
              probe.src = objectUrl;
            }
          }}
        />
      ) : !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={objectUrl}
          alt={title}
          className={`rounded-xl object-contain transition-all duration-300 ${
            isExpanded ? "max-w-6xl max-h-[750px]" : "max-w-4xl max-h-[520px]"
          }`}
          loading="lazy"
          data-why-static="GIF tidak tersedia atau SVG tanpa animasi"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <AnimationErrorFallback
          url={url}
          title={title}
          detail={inlineError || undefined}
          onRetry={() => {
            setInline(null);
            setInlineError(null);
            setObjectFailed(false);
            setImgFailed(false);
          }}
        />
      )}
    </div>
  );
}

function SvgScope({
  html,
  className,
  ...rest
}: { html: string; className?: string } & Pick<HTMLAttributes<HTMLDivElement>, "style" | "onClick" | "onLoad">) {
  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ overflow: "hidden" }}
      {...rest}
    />
  );
}

function AnimationHeader({
  t,
  typeLabel,
  isExpanded,
  onToggleExpand,
}: {
  t: (k: string) => string;
  typeLabel: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎬</span>
        <h3 className="font-bold text-sm sm:text-base">{t("animasi")}</h3>
        {typeLabel && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wide">
            {typeLabel}
          </span>
        )}
      </div>

      {onToggleExpand && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-bg-alt text-ink flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          title={isExpanded ? "Perkecil tampilan animasi" : "Perbesar tampilan animasi"}
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Ukuran Standar</span>
              <span className="sm:hidden">Kecilkan</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Perbesar Animasi</span>
              <span className="sm:hidden">Perbesar</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

function isSafeHttpUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed);
}

function AnimationErrorFallback({
  title,
  url,
  detail,
  onRetry,
}: {
  title: string;
  url: string;
  detail?: string;
  onRetry?: () => void;
}) {
  const { t } = useLangStore();
  return (
    <div className="flex flex-col items-center gap-2 text-center p-4 max-w-md">
      <span className="text-3xl opacity-50">🎬</span>
      <p className="text-sm text-ink font-semibold">Animasi tidak bisa dimuat dari server.</p>
      {detail && <p className="text-[11px] text-muted/80">{detail}</p>}
      <p className="text-[11px] text-muted/70 break-all">{url}</p>
      <div className="flex gap-2 mt-1 flex-wrap justify-center">
        {isSafeHttpUrl(url) && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark"
          >
            Buka di Tab Baru
          </a>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-bg-alt"
          >
            {t("quiz.again")}
          </button>
        )}
        <span className="text-[10px] text-muted/60 self-center">{title}</span>
      </div>
    </div>
  );
}

function animUrlAsEmbed(url: string): string {
  if (!url) return "";
  if (/youtube\.com\/embed|youtube\.com\/shorts\/embed|player\.vimeo\.com|h5p/.test(url)) {
    return url;
  }
  const ytWatchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (ytWatchMatch) return `https://www.youtube.com/embed/${ytWatchMatch[1]}`;
  return "";
}

/* ───────── InlineVideoSection ───────── */
export function InlineVideoSection({
  subVideoUrl,
  babVideoId,
}: {
  subVideoUrl: string;
  babVideoId: string;
}) {
  const { t } = useLangStore();

  if (subVideoUrl) {
    const embedUrl = animUrlAsEmbed(subVideoUrl);
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">▶</span>
          <h3 className="font-bold text-sm">{t("video")}</h3>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black shadow-card border border-border/50">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title="Video Sub-Bab"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  }

  if (babVideoId) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">▶</span>
          <h3 className="font-bold text-sm">{t("video")}</h3>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black shadow-card border border-border/50">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${babVideoId}`}
              title="Video Bab"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ───────── InlineImageSection ───────── */
export function InlineImageSection({
  imageUrl,
  altText,
}: {
  imageUrl: string;
  altText: string;
}) {
  const { t } = useLangStore();
  if (!imageUrl) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🖼️</span>
        <h3 className="font-bold text-sm">{t("image")}</h3>
      </div>
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-3 sm:p-4 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-[480px] rounded-xl object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}
