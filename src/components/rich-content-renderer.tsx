"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Microscope,
  Flag,
  Wind,
  Utensils,
  Shield,
} from "lucide-react";

interface RichContentRendererProps {
  html: string;
  lang?: string;
}

// Icon mapping berdasarkan keyword di h3
const SECTION_ICONS: Record<string, React.ReactNode> = {
  bentuk: <Microscope className="w-5 h-5" />,
  flagela: <Flag className="w-5 h-5" />,
  oksigen: <Wind className="w-5 h-5" />,
  makanan: <Utensils className="w-5 h-5" />,
  "dinding sel": <Shield className="w-5 h-5" />,
  respirasi: <Wind className="w-5 h-5" />,
  karakteristik: <Shield className="w-5 h-5" />,
};

// Warna badge per klasifikasi
const SECTION_COLORS: Record<string, string> = {
  bentuk: "bg-purple-100 text-purple-700 border-purple-200",
  flagela: "bg-blue-100 text-blue-700 border-blue-200",
  oksigen: "bg-sky-100 text-sky-700 border-sky-200",
  makanan: "bg-amber-100 text-amber-700 border-amber-200",
  "dinding sel": "bg-emerald-100 text-emerald-700 border-emerald-200",
  respirasi: "bg-sky-100 text-sky-700 border-sky-200",
};

function getSectionIcon(title: string): React.ReactNode {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return null;
}

function getSectionColor(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, color] of Object.entries(SECTION_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

// Parse HTML jadi sections berdasarkan h3
function parseSections(html: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;
  let lastIndex = 0;
  let match;

  const h3Matches = [...html.matchAll(h3Regex)];

  if (h3Matches.length === 0) {
    // Kalau ga ada h3, return semua sebagai satu section
    return [{ title: "", content: html }];
  }

  h3Matches.forEach((m, i) => {
    const title = m[1].replace(/<[^>]+>/g, "").trim();
    const startIndex = m.index!;

    // Content sebelum h3 pertama (jika ada)
    if (i === 0 && startIndex > 0) {
      const beforeContent = html.slice(0, startIndex).trim();
      if (beforeContent) {
        sections.push({ title: "", content: beforeContent });
      }
    }

    // Content setelah h3 ini sampai h3 berikutnya
    const nextStart =
      i < h3Matches.length - 1 ? h3Matches[i + 1].index! : html.length;
    const content = html.slice(startIndex + m[0].length, nextStart).trim();

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
}: {
  title: string;
  content: string;
  defaultOpen?: boolean;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [content]);

  const icon = getSectionIcon(title);
  const colorClass = getSectionColor(title);

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden mb-3 bg-surface">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-2/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          {/* Section Number */}
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>

          {/* Icon */}
          {icon && (
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-muted group-hover:text-accent transition-colors">
              {icon}
            </span>
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold text-ink group-hover:text-accent-dark transition-colors">
            {title}
          </h3>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion Content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${height}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          className="px-4 pb-4 pt-0 text-sm leading-relaxed text-muted
            [&_h4]:text-accent [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:text-sm [&_h4]:uppercase [&_h4]:tracking-wide
            [&_p]:leading-relaxed [&_p]:my-2
            [&_strong]:text-ink [&_strong]:font-semibold
            [&_em]:text-accent [&_em]:italic
            [&_ul]:!list-disc [&_ul]:!pl-6 [&_ul]:!my-3 [&_ul]:!space-y-1.5
            [&_ol]:!list-decimal [&_ol]:!pl-6 [&_ol]:!my-3 [&_ol]:!space-y-1.5
            [&_li]:!pl-1 [&_li]:!marker:text-accent"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

export function RichContentRenderer({ html }: RichContentRendererProps) {
  const sections = parseSections(html);

  return (
    <div className="space-y-1">
      {/* Render sections */}
      {sections.map((section, i) => (
        <AccordionSection
          key={i}
          title={section.title}
          content={section.content}
          index={i}
          defaultOpen={i === 0} // Buka section pertama by default
        />
      ))}
    </div>
  );
}
