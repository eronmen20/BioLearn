"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  X,
  Image as ImageIcon,
  ChevronsUpDown,
  ZoomIn,
} from "lucide-react";

interface ExtractedImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ParsedSection {
  title: string;
  content: string;
  image: ExtractedImage | null;
}

interface RichContentRendererProps {
  html: string;
  lang?: string;
}

// Warna gradient per section index (cycle)
const SECTION_GRADIENTS = [
  "from-emerald-500/10 via-teal-500/5 to-transparent",
  "from-amber-500/10 via-orange-500/5 to-transparent",
  "from-indigo-500/10 via-blue-500/5 to-transparent",
  "from-violet-500/10 via-purple-500/5 to-transparent",
  "from-rose-500/10 via-pink-500/5 to-transparent",
  "from-cyan-500/10 via-sky-500/5 to-transparent",
];

const SECTION_ICON_COLORS = [
  "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
  "text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  "text-indigo-700 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
  "text-violet-700 bg-violet-100 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-800",
  "text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800",
  "text-cyan-700 bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
];

// Helper to extract image from section HTML
function extractImageFromContent(html: string): { cleanedContent: string; image: ExtractedImage | null } {
  // 1. Check for <figure> tags
  const figureRegex = /<figure[^>]*>([\s\S]*?)<\/figure>/i;
  const figMatch = html.match(figureRegex);
  if (figMatch) {
    const figContent = figMatch[1];
    const imgMatch = figContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    const capMatch = figContent.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    if (imgMatch) {
      const src = imgMatch[1];
      const altMatch = imgMatch[0].match(/alt=["']([^"']*)["']/i);
      const cleaned = html.replace(figureRegex, "").trim();
      return {
        cleanedContent: cleaned,
        image: {
          src,
          alt: altMatch ? altMatch[1] : "",
          caption: capMatch ? capMatch[1].replace(/<[^>]+>/g, "").trim() : "",
        },
      };
    }
  }

  // 2. Check for standalone <img> tags
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*\/?>/i;
  const match = html.match(imgRegex);
  if (match) {
    const src = match[1];
    const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
    const titleMatch = match[0].match(/title=["']([^"']*)["']/i);

    // Remove any <p><img ...></p> if img is the main child of p
    const escapedImg = match[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pWithImgRegex = new RegExp(`<p[^>]*>\\s*${escapedImg}\\s*<\\/p>`, "i");
    let cleaned = html;
    if (pWithImgRegex.test(html)) {
      cleaned = html.replace(pWithImgRegex, "").trim();
    } else {
      cleaned = html.replace(match[0], "").trim();
    }

    return {
      cleanedContent: cleaned,
      image: {
        src,
        alt: altMatch ? altMatch[1] : "",
        caption: titleMatch ? titleMatch[1] : "",
      },
    };
  }

  return { cleanedContent: html, image: null };
}

// Parse HTML into sections based on <h3>
function parseSections(html: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;
  const h3Matches = [...html.matchAll(h3Regex)];

  if (h3Matches.length === 0) {
    const trimmed = html.trim();
    if (trimmed) {
      const { cleanedContent, image } = extractImageFromContent(trimmed);
      return [{ title: "", content: cleanedContent, image }];
    }
    return [];
  }

  h3Matches.forEach((m, i) => {
    const title = m[1].replace(/<[^>]+>/g, "").trim();
    const startIndex = m.index!;
    const nextStart = i < h3Matches.length - 1 ? h3Matches[i + 1].index! : html.length;
    const rawContent = html.slice(startIndex + m[0].length, nextStart).trim();

    if (!rawContent || rawContent === "<br>" || rawContent === "<br/>" || rawContent === "<p></p>") {
      return;
    }

    const { cleanedContent, image } = extractImageFromContent(rawContent);
    sections.push({ title, content: cleanedContent, image });
  });

  return sections;
}

// Interactive Section Card with side-by-side text + optional image
function SectionCard({
  section,
  index,
  isOpen,
  onToggle,
  onOpenLightbox,
  lang = "id",
}: {
  section: ParsedSection;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onOpenLightbox: (img: ExtractedImage, title: string) => void;
  lang?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const gradient = SECTION_GRADIENTS[index % SECTION_GRADIENTS.length];
  const iconColor = SECTION_ICON_COLORS[index % SECTION_ICON_COLORS.length];
  const hasImage = Boolean(section.image && section.image.src);

  return (
    <div className="group relative transition-all duration-300 ease-out">
      {/* Outer Card */}
      <div
        className={`
          relative
          border border-border/70
          rounded-2xl
          overflow-hidden
          mb-4
          bg-surface
          transition-all duration-300 ease-out
          hover:border-accent/40
          hover:shadow-[0_8px_30px_rgb(0,0,0,0.06),0_2px_8px_rgb(0,0,0,0.04)]
          ${isOpen ? "shadow-[0_4px_20px_rgb(0,0,0,0.05),0_1px_4px_rgb(0,0,0,0.03)] ring-1 ring-accent/15" : "shadow-sm"}
        `}
      >
        {/* Subtle decorative background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none opacity-80`}
        />

        {/* Section Header Button */}
        <button
          onClick={onToggle}
          className="relative w-full flex items-center justify-between p-3.5 sm:p-4.5 text-left group/btn cursor-pointer select-none"
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2">
            {/* Number Badge */}
            <span
              className={`
                flex-shrink-0
                w-8 h-8 sm:w-9 sm:h-9
                rounded-xl
                border
                ${iconColor}
                text-xs sm:text-sm
                font-extrabold
                flex items-center justify-center
                shadow-sm
                transition-transform duration-200
                group-hover/btn:scale-105
              `}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-ink group-hover/btn:text-accent-dark transition-colors truncate">
                {section.title}
              </h3>
            </div>
          </div>

          {/* Chevron Toggle */}
          <div
            className={`
              flex-shrink-0
              w-7 h-7 sm:w-8 sm:h-8
              rounded-lg
              flex items-center justify-center
              bg-surface-2/80
              border border-border/50
              shadow-sm
              transition-all duration-200
              group-hover/btn:border-accent/40
              ${isOpen ? "bg-accent/10 border-accent/30 text-accent" : "text-muted"}
            `}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isOpen ? "rotate-180 text-accent" : ""
              }`}
            />
          </div>
        </button>

        {/* Section Body (Collapsible / Expandable) */}
        {isOpen && (
          <div className="relative border-t border-border/40 px-3.5 sm:px-5 py-4 sm:py-5 bg-surface/50">
            {/* Side-by-Side Grid if Image Exists, Full-width if No Image */}
            <div
              className={
                hasImage
                  ? "grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start"
                  : "w-full"
              }
            >
              {/* Text Column */}
              <div
                className={
                  hasImage
                    ? "lg:col-span-7 order-2 lg:order-1 space-y-3"
                    : "w-full space-y-3"
                }
              >
                <div
                  ref={contentRef}
                  className="
                    rich-text-content
                    text-xs sm:text-sm leading-relaxed text-muted
                    [&_h4]:text-accent-dark [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:text-xs sm:[&_h4]:text-sm
                    [&_p]:leading-relaxed [&_p]:my-2
                    [&_strong]:text-ink [&_strong]:font-semibold
                    [&_em]:text-accent [&_em]:italic [&_em]:font-medium
                    [&_ul]:!list-disc [&_ul]:!pl-5 [&_ul]:!my-2.5 [&_ul]:!space-y-1.5
                    [&_ol]:!list-decimal [&_ol]:!pl-5 [&_ol]:!my-2.5 [&_ol]:!space-y-1.5
                    [&_li]:!pl-1 [&_li]:!marker:text-accent
                    [&_h5]:text-ink [&_h5]:font-semibold [&_h5]:mt-2 [&_h5]:mb-1 [&_h5]:text-xs
                  "
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>

              {/* Image Column (Only rendered when image is present!) */}
              {hasImage && section.image && (
                <div className="lg:col-span-5 order-1 lg:order-2">
                  <div className="sticky top-20">
                    <div
                      onClick={() => onOpenLightbox(section.image!, section.title)}
                      className="
                        group/img relative
                        rounded-2xl
                        overflow-hidden
                        border border-border/80
                        bg-surface-2
                        shadow-sm
                        hover:shadow-md
                        hover:border-accent/40
                        transition-all duration-300
                        cursor-zoom-in
                      "
                    >
                      {/* Zoom Indicator overlay */}
                      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white flex items-center gap-1 opacity-80 group-hover/img:opacity-100 transition-opacity">
                        <ZoomIn className="w-3 h-3 text-cyan-300" />
                        <span>Zoom</span>
                      </div>

                      {/* Image container */}
                      <div className="p-2 sm:p-3 bg-gradient-to-b from-bg-alt/80 to-surface-2 flex items-center justify-center min-h-[180px] sm:min-h-[220px]">
                        <img
                          src={section.image.src}
                          alt={section.image.alt || section.title}
                          className="w-full h-auto max-h-[260px] object-contain transition-transform duration-300 group-hover/img:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>

                      {/* Caption / Alt Bar */}
                      <div className="px-3 py-2 bg-surface border-t border-border/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ImageIcon className="w-3 h-3 text-accent flex-shrink-0" />
                          <span className="text-[11px] font-medium text-ink truncate">
                            {section.image.alt || section.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-accent font-semibold flex-shrink-0">
                          {lang === "en" ? "Click to expand" : "Lihat detail"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fullscreen Lightbox Modal
function LightboxModal({
  image,
  title,
  onClose,
}: {
  image: ExtractedImage | null;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[90vh] bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col animate-scale-up"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-accent" />
            <h4 className="font-bold text-sm text-ink truncate">{title}</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Image Body */}
        <div className="p-4 sm:p-8 flex items-center justify-center overflow-auto bg-black/5 dark:bg-black/30 flex-1">
          <img
            src={image.src}
            alt={image.alt || title}
            className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
          />
        </div>

        {/* Modal Caption */}
        <div className="px-4 py-3 bg-surface border-t border-border flex items-center justify-between text-xs text-muted">
          <span>{image.alt || title}</span>
          <span className="text-[11px] text-accent font-medium">Tekan ESC atau klik luar untuk menutup</span>
        </div>
      </div>
    </div>
  );
}

// Main RichContentRenderer Component
export function RichContentRenderer({ html, lang = "id" }: RichContentRendererProps) {
  const sections = parseSections(html);

  // Track which sections are open (default all open for rich cards experience)
  const [openSections, setOpenSections] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    sections.forEach((_, i) => {
      initial[i] = true; // All open by default so users see side-by-side images immediately
    });
    return initial;
  });

  // Lightbox state
  const [lightboxData, setLightboxData] = useState<{
    image: ExtractedImage;
    title: string;
  } | null>(null);

  // If no sections parsed (or fallback plain text)
  if (sections.length === 0) {
    return (
      <div
        className="text-xs sm:text-sm leading-relaxed text-muted
          [&_h3]:text-accent-dark [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-sm sm:[&_h3]:text-base
          [&_h4]:text-accent [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:text-xs sm:[&_h4]:text-sm
          [&_p]:leading-relaxed [&_p]:my-2
          [&_strong]:text-ink [&_strong]:font-semibold
          [&_em]:text-accent [&_em]:italic
          [&_ul]:!list-disc [&_ul]:!pl-5 [&_ul]:!my-2.5
          [&_ol]:!list-decimal [&_ol]:!pl-5 [&_ol]:!my-2.5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const allOpen = Object.values(openSections).every(Boolean);

  const toggleAll = () => {
    const nextState = !allOpen;
    const updated: Record<number, boolean> = {};
    sections.forEach((_, i) => {
      updated[i] = nextState;
    });
    setOpenSections(updated);
  };

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Expand/Collapse Toggle */}
      {sections.length > 1 && (
        <div className="flex items-center justify-end pb-2 border-b border-border/50 text-xs">
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-muted hover:text-ink hover:bg-bg-alt transition-colors cursor-pointer"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>
              {allOpen
                ? lang === "en"
                  ? "Collapse All"
                  : "Tutup Semua"
                : lang === "en"
                ? "Expand All"
                : "Buka Semua"}
            </span>
          </button>
        </div>
      )}

      {/* Render Each Numbered Section Card */}
      <div className="space-y-3">
        {sections.map((section, i) => (
          <SectionCard
            key={i}
            section={section}
            index={i}
            isOpen={openSections[i] ?? true}
            onToggle={() => toggleSection(i)}
            onOpenLightbox={(img, title) => setLightboxData({ image: img, title })}
            lang={lang}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxData && (
        <LightboxModal
          image={lightboxData.image}
          title={lightboxData.title}
          onClose={() => setLightboxData(null)}
        />
      )}
    </div>
  );
}
