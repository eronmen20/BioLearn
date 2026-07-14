"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Layers,
  Shapes,
  FlaskConical,
  Dna,
  BookOpen,
} from "lucide-react";

interface RichContentRendererProps {
  html: string;
  lang?: string;
}

// Warna gradient per section index (cycle)
const SECTION_GRADIENTS = [
  "from-violet-500/10 to-purple-500/5",
  "from-blue-500/10 to-cyan-500/5",
  "from-emerald-500/10 to-teal-500/5",
  "from-amber-500/10 to-orange-500/5",
  "from-rose-500/10 to-pink-500/5",
  "from-indigo-500/10 to-blue-500/5",
];

const SECTION_ICON_COLORS = [
  "text-violet-600 bg-violet-100",
  "text-blue-600 bg-blue-100",
  "text-emerald-600 bg-emerald-100",
  "text-amber-600 bg-amber-100",
  "text-rose-600 bg-rose-100",
  "text-indigo-600 bg-indigo-100",
];

// Parse HTML jadi sections berdasarkan h3
function parseSections(html: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;

  const h3Matches = [...html.matchAll(h3Regex)];

  if (h3Matches.length === 0) {
    // Kalau ga ada h3, return semua sebagai satu section
    const trimmed = html.trim();
    if (trimmed) {
      return [{ title: "", content: trimmed }];
    }
    return [];
  }

  h3Matches.forEach((m, i) => {
    const title = m[1].replace(/<[^>]+>/g, "").trim();
    const startIndex = m.index!;

    // Content sebelum h3 pertama → skip (biasanya kosong/tidak penting)
    // Atau kalau mau include, bisa dijadikan section terpisah

    // Content setelah h3 ini sampai h3 berikutnya
    const nextStart =
      i < h3Matches.length - 1 ? h3Matches[i + 1].index! : html.length;
    const content = html.slice(startIndex + m[0].length, nextStart).trim();

    // Skip section kosong (ga ada konten)
    if (!content || content === "<br>" || content === "<br/>" || content === "<p></p>") {
      return;
    }

    sections.push({ title, content });
  });

  return sections;
}

// Accordion section component
function AccordionSection({
  title,
  content,
  defaultOpen = false,
  index,
  totalSections,
}: {
  title: string;
  content: string;
  defaultOpen?: boolean;
  index: number;
  totalSections: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [content]);

  const gradient = SECTION_GRADIENTS[index % SECTION_GRADIENTS.length];
  const iconColor = SECTION_ICON_COLORS[index % SECTION_ICON_COLORS.length];

  return (
    <div className="group relative">
      {/* 3D Card */}
      <div
        className={`
          relative
          border border-border/60
          rounded-2xl
          overflow-hidden
          mb-4
          bg-surface
          transition-all duration-300 ease-out
          hover:translate-y-[-2px]
          hover:shadow-[0_8px_30px_rgb(0,0,0,0.08),0_4px_12px_rgb(0,0,0,0.04)]
          ${isOpen ? "shadow-[0_4px_20px_rgb(0,0,0,0.06),0_2px_8px_rgb(0,0,0,0.03)]" : "shadow-[0_2px_10px_rgb(0,0,0,0.04),0_1px_4px_rgb(0,0,0,0.02)]"}
        `}
      >
        {/* Gradient background strip */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 pointer-events-none`}
        />

        {/* Accordion Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full flex items-center justify-between p-4 sm:p-5 text-left group/btn"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Section Number - 3D badge */}
            <span
              className={`
                flex-shrink-0
                w-8 h-8 sm:w-9 sm:h-9
                rounded-xl
                ${iconColor}
                text-xs sm:text-sm
                font-bold
                flex items-center justify-center
                shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.08)]
                transition-transform duration-200
                group-hover/btn:scale-110
              `}
            >
              {index + 1}
            </span>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-bold text-ink group-hover/btn:text-accent-dark transition-colors">
              {title}
            </h3>
          </div>

          {/* Chevron - 3D style */}
          <div
            className={`
              flex-shrink-0
              w-7 h-7 sm:w-8 sm:h-8
              rounded-lg
              flex items-center justify-center
              bg-surface-2
              shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.08)]
              transition-all duration-200
              ${isOpen ? "bg-accent/10 rotate-0" : ""}
            `}
          >
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-300 ${
                isOpen ? "rotate-180 text-accent" : ""
              }`}
            />
          </div>
        </button>

        {/* Accordion Content - 3D inset */}
        <div
          className="relative overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: isOpen ? `${height}px` : "0px",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
            {/* Content area with inset shadow effect */}
            <div
              ref={contentRef}
              className="
                p-4 sm:p-5
                rounded-xl
                bg-surface-2/50
                border border-border/30
                shadow-[inset_0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(0,0,0,0.02)]
                text-sm leading-relaxed text-muted
                [&_h4]:text-accent [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-2 [&_h4]:text-sm [&_h4]:uppercase [&_h4]:tracking-wide
                [&_p]:leading-relaxed [&_p]:my-2
                [&_strong]:text-ink [&_strong]:font-bold
                [&_em]:text-accent [&_em]:italic [&_em]:font-medium
                [&_ul]:!list-disc [&_ul]:!pl-6 [&_ul]:!my-3 [&_ul]:!space-y-2
                [&_ol]:!list-decimal [&_ol]:!pl-6 [&_ol]:!my-3 [&_ol]:!space-y-2
                [&_li]:!pl-1 [&_li]:!marker:text-accent
                [&_ul_ul]:!list-circle [&_ol_ol]:!list-lower-alpha
                [&_h5]:text-ink [&_h5]:font-semibold [&_h5]:mt-2 [&_h5]:mb-1 [&_h5]:text-xs
              "
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RichContentRenderer({ html }: RichContentRendererProps) {
  const sections = parseSections(html);

  // Kalau ga ada sections, render HTML biasa
  if (sections.length === 0) {
    return (
      <div
        className="text-sm leading-relaxed text-muted
          [&_h3]:text-accent-dark [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base
          [&_h4]:text-accent [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-2 [&_h4]:text-sm
          [&_p]:leading-relaxed [&_p]:my-2
          [&_strong]:text-ink [&_strong]:font-bold
          [&_em]:text-accent [&_em]:italic
          [&_ul]:!list-disc [&_ul]:!pl-6 [&_ul]:!my-3
          [&_ol]:!list-decimal [&_ol]:!pl-6 [&_ol]:!my-3"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Kalau cuma 1 section tanpa title, render langsung (tanpa accordion)
  if (sections.length === 1 && !sections[0].title) {
    return (
      <div
        className="text-sm leading-relaxed text-muted
          [&_h3]:text-accent-dark [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base
          [&_h4]:text-accent [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-2 [&_h4]:text-sm
          [&_p]:leading-relaxed [&_p]:my-2
          [&_strong]:text-ink [&_strong]:font-bold
          [&_em]:text-accent [&_em]:italic
          [&_ul]:!list-disc [&_ul]:!pl-6 [&_ul]:!my-3
          [&_ol]:!list-decimal [&_ol]:!pl-6 [&_ol]:!my-3"
        dangerouslySetInnerHTML={{ __html: sections[0].content }}
      />
    );
  }

  return (
    <div className="space-y-1">
      {/* Render sections */}
      {sections.map((section, i) => (
        <AccordionSection
          key={i}
          title={section.title}
          content={section.content}
          index={i}
          totalSections={sections.length}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
