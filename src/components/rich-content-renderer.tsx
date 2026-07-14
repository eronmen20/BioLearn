"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
    const trimmed = html.trim();
    if (trimmed) {
      return [{ title: "", content: trimmed }];
    }
    return [];
  }

  h3Matches.forEach((m, i) => {
    const title = m[1].replace(/<[^>]+>/g, "").trim();
    const startIndex = m.index!;

    const nextStart =
      i < h3Matches.length - 1 ? h3Matches[i + 1].index! : html.length;
    const content = html.slice(startIndex + m[0].length, nextStart).trim();

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

  const gradient = SECTION_GRADIENTS[index % SECTION_GRADIENTS.length];
  const iconColor = SECTION_ICON_COLORS[index % SECTION_ICON_COLORS.length];

  return (
    <div className="group relative">
      {/* 3D Card */}
      <div
        className={`
          relative
          border border-border/60
          rounded-xl
          overflow-hidden
          mb-3
          bg-surface
          transition-all duration-300 ease-out
          hover:translate-y-[-1px]
          hover:shadow-[0_6px_20px_rgb(0,0,0,0.06),0_3px_8px_rgb(0,0,0,0.03)]
          ${isOpen ? "shadow-[0_3px_14px_rgb(0,0,0,0.05),0_1px_6px_rgb(0,0,0,0.02)]" : "shadow-[0_1px_6px_rgb(0,0,0,0.03),0_1px_3px_rgb(0,0,0,0.02)]"}
        `}
      >
        {/* Gradient background strip */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 pointer-events-none`}
        />

        {/* Accordion Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full flex items-center justify-between p-3 sm:p-3.5 text-left group/btn"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Section Number */}
            <span
              className={`
                flex-shrink-0
                w-6 h-6 sm:w-7 sm:h-7
                rounded-lg
                ${iconColor}
                text-[10px] sm:text-xs
                font-bold
                flex items-center justify-center
                shadow-[inset_0_-1px_3px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)]
                transition-transform duration-200
                group-hover/btn:scale-110
              `}
            >
              {index + 1}
            </span>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-semibold text-ink group-hover/btn:text-accent-dark transition-colors">
              {title}
            </h3>
          </div>

          {/* Chevron */}
          <div
            className={`
              flex-shrink-0
              w-6 h-6 sm:w-7 sm:h-7
              rounded-md
              flex items-center justify-center
              bg-surface-2
              shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.06)]
              transition-all duration-200
              ${isOpen ? "bg-accent/10 rotate-0" : ""}
            `}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${
                isOpen ? "rotate-180 text-accent" : ""
              }`}
            />
          </div>
        </button>

        {/* Accordion Content */}
        <div
          className="relative overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: isOpen ? `${height}px` : "0px",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div
              ref={contentRef}
              className="
                p-3 sm:p-4
                rounded-lg
                bg-surface-2/50
                border border-border/30
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(0,0,0,0.02)]
                text-xs leading-relaxed text-muted
                [&_h4]:text-accent [&_h4]:font-semibold [&_h4]:mt-2.5 [&_h4]:mb-1.5 [&_h4]:text-xs [&_h4]:uppercase [&_h4]:tracking-wide
                [&_p]:leading-relaxed [&_p]:my-1.5
                [&_strong]:text-ink [&_strong]:font-semibold
                [&_em]:text-accent [&_em]:italic [&_em]:font-medium
                [&_ul]:!list-disc [&_ul]:!pl-5 [&_ul]:!my-2 [&_ul]:!space-y-1
                [&_ol]:!list-decimal [&_ol]:!pl-5 [&_ol]:!my-2 [&_ol]:!space-y-1
                [&_li]:!pl-0.5 [&_li]:!marker:text-accent
                [&_ul_ul]:!list-circle [&_ol_ol]:!list-lower-alpha
                [&_h5]:text-ink [&_h5]:font-semibold [&_h5]:mt-2 [&_h5]:mb-1 [&_h5]:text-[11px]
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

  if (sections.length === 0) {
    return (
      <div
        className="text-xs leading-relaxed text-muted
          [&_h3]:text-accent-dark [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-sm
          [&_h4]:text-accent [&_h4]:font-semibold [&_h4]:mt-2.5 [&_h4]:mb-1.5 [&_h4]:text-xs
          [&_p]:leading-relaxed [&_p]:my-1.5
          [&_strong]:text-ink [&_strong]:font-semibold
          [&_em]:text-accent [&_em]:italic
          [&_ul]:!list-disc [&_ul]:!pl-5 [&_ul]:!my-2
          [&_ol]:!list-decimal [&_ol]:!pl-5 [&_ol]:!my-2"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (sections.length === 1 && !sections[0].title) {
    return (
      <div
        className="text-xs leading-relaxed text-muted
          [&_h3]:text-accent-dark [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-sm
          [&_h4]:text-accent [&_h4]:font-semibold [&_h4]:mt-2.5 [&_h4]:mb-1.5 [&_h4]:text-xs
          [&_p]:leading-relaxed [&_p]:my-1.5
          [&_strong]:text-ink [&_strong]:font-semibold
          [&_em]:text-accent [&_em]:italic
          [&_ul]:!list-disc [&_ul]:!pl-5 [&_ul]:!my-2
          [&_ol]:!list-decimal [&_ol]:!pl-5 [&_ol]:!my-2"
        dangerouslySetInnerHTML={{ __html: sections[0].content }}
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {sections.map((section, i) => (
        <AccordionSection
          key={i}
          title={section.title}
          content={section.content}
          index={i}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
