"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Eye,
  FlaskConical,
  Globe,
  Brain,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Pill,
  Wheat,
  Hand,
} from "lucide-react";
import { useLangStore } from "@/lib/lang-store";
import { settingsText, type HomepageSettings } from "@/components/sections/landing-page";

/* ───────── Small shared bits ───────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3">
      {children}
    </span>
  );
}

/* ───────── 1. LearnModes — 4 cara belajar, tab interaktif ───────── */

const MODES = [
  {
    id: "lihat",
    icon: <Eye className="w-5 h-5" />,
    titleField: "tab_lihat_title" as const,
    titleKey: "landing.tab_lihat_title",
    descField: "tab_lihat_desc" as const,
    descKey: "landing.tab_lihat_desc",
    href: "/bab/bakteri",
    gradient: "from-emerald-400 to-green-500",
    softBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    ring: "ring-emerald-500/30",
  },
  {
    id: "coba",
    icon: <FlaskConical className="w-5 h-5" />,
    titleField: "tab_coba_title" as const,
    titleKey: "landing.tab_coba_title",
    descField: "tab_coba_desc" as const,
    descKey: "landing.tab_coba_desc",
    href: "/dashboard",
    gradient: "from-cyan-400 to-teal-500",
    softBg: "bg-cyan-50",
    iconColor: "text-cyan-500",
    ring: "ring-cyan-500/30",
  },
  {
    id: "isu",
    icon: <Globe className="w-5 h-5" />,
    titleField: "tab_isu_title" as const,
    titleKey: "landing.tab_isu_title",
    descField: "tab_isu_desc" as const,
    descKey: "landing.tab_isu_desc",
    href: "#isu-nyata",
    gradient: "from-amber-400 to-orange-500",
    softBg: "bg-amber-50",
    iconColor: "text-amber-500",
    ring: "ring-amber-500/30",
  },
  {
    id: "uji",
    icon: <Brain className="w-5 h-5" />,
    titleField: "tab_uji_title" as const,
    titleKey: "landing.tab_uji_title",
    descField: "tab_uji_desc" as const,
    descKey: "landing.tab_uji_desc",
    href: "#coba-soal",
    gradient: "from-violet-400 to-purple-500",
    softBg: "bg-violet-50",
    iconColor: "text-violet-500",
    ring: "ring-violet-500/30",
  },
];

export function LearnModes({ settings }: { settings?: HomepageSettings }) {
  const { t } = useLangStore();
  const [active, setActive] = useState("lihat");
  const modes = MODES.map((m) => ({
    ...m,
    title: settingsText(settings?.[m.titleField]) || t(m.titleKey),
    desc: settingsText(settings?.[m.descField]) || t(m.descKey),
  }));
  const mode = modes.find((m) => m.id === active) ?? modes[0];

  return (
    <div>
      {/* Tab buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
        {modes.map((m) => {
          const isActive = m.id === active;
          return (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer ${
                isActive
                  ? `bg-gradient-to-r ${m.gradient} text-white border-transparent shadow-lg`
                  : "bg-surface text-muted border-border/60 hover:border-accent/40 hover:text-ink"
              }`}
            >
              <span className={isActive ? "" : m.iconColor}>{m.icon}</span>
              {m.title}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <motion.div
        key={mode.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`relative p-6 sm:p-8 rounded-3xl bg-surface border border-border/50 shadow-card overflow-hidden ring-1 ${mode.ring}`}
      >
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${mode.gradient}`} />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className={`w-14 h-14 ${mode.softBg} rounded-2xl flex items-center justify-center ${mode.iconColor} flex-shrink-0`}>
            <span className="[&>svg]:w-7 [&>svg]:h-7">{mode.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-lg sm:text-xl text-ink mb-1">
              {mode.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">{mode.desc}</p>
          </div>
          <Link
            href={mode.href}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm bg-gradient-to-r ${mode.gradient} hover:opacity-90 transition-opacity flex-shrink-0`}
          >
            {t("landing.modes_cta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/* ───────── 2. MiniQuiz — coba satu soal Benar/Salah ───────── */

export function MiniQuiz({ settings }: { settings?: HomepageSettings }) {
  const { t } = useLangStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  // Kunci jawaban (index opsi): default 1 = Salah. Bisa diubah lewat admin.
  const answerIdx = settings?.quiz_answer === 0 ? 0 : 1;
  const isCorrect = selected === answerIdx;
  const options = [
    settingsText(settings?.quiz_opt_true) || t("landing.quiz_opt_true"),
    settingsText(settings?.quiz_opt_false) || t("landing.quiz_opt_false"),
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-accent/[0.06] to-surface border border-accent/20 shadow-card">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-extrabold text-ink">{settingsText(settings?.quiz_title) || t("landing.quiz_title")}</h3>
          <p className="text-xs text-muted">{settingsText(settings?.quiz_desc) || t("landing.quiz_desc")}</p>
        </div>
      </div>

      <p className="text-sm sm:text-base font-semibold text-ink my-4">
        {settingsText(settings?.quiz_q) || t("landing.quiz_q")}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => !checked && setSelected(i)}
            disabled={checked}
            className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
              checked
                ? i === answerIdx
                  ? "border-green bg-green-light text-green"
                  : i === selected
                  ? "border-red bg-red-light text-red"
                  : "border-border text-muted"
                : selected === i
                ? "border-accent bg-accent/5 text-accent"
                : "border-border text-ink hover:border-accent/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {checked ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className={`p-4 rounded-xl mb-4 flex items-start gap-2 ${
              isCorrect ? "bg-green-light" : "bg-red-light"
            }`}
          >
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-bold ${isCorrect ? "text-green" : "text-red"}`}>
                {isCorrect ? t("landing.quiz_correct") : t("landing.quiz_wrong")}
              </p>
              {!isCorrect && (
                <div className="flex items-start gap-1.5 mt-2">
                  <Lightbulb className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted leading-relaxed">{settingsText(settings?.quiz_explain) || t("landing.quiz_explain")}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                setSelected(null);
                setChecked(false);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border-2 border-border text-sm font-bold text-muted hover:text-ink hover:border-accent/40 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {t("landing.quiz_retry")}
            </button>
            <Link
              href="/bab/bakteri"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-bold hover:bg-accent-dark transition-colors"
            >
              {t("landing.quiz_cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => selected !== null && setChecked(true)}
          disabled={selected === null}
          className="px-6 py-2.5 rounded-full bg-accent text-white text-sm font-bold hover:bg-accent-dark transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          {t("landing.quiz_check")}
        </button>
      )}
    </div>
  );
}

/* ───────── 3. RealWorldIssues — isu biologi dunia nyata ───────── */

const ISSUES = [
  {
    icon: <Pill className="w-6 h-6" />,
    href: "/bab/bakteri?sub=sub.bakteri3",
    titleField: "issue1_title" as const,
    titleKey: "landing.issue1_title",
    descField: "issue1_desc" as const,
    descKey: "landing.issue1_desc",
    gradient: "from-rose-400 to-red-500",
    softBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    icon: <Wheat className="w-6 h-6" />,
    href: "/bab/bakteri?sub=sub.bakteri5",
    titleField: "issue2_title" as const,
    titleKey: "landing.issue2_title",
    descField: "issue2_desc" as const,
    descKey: "landing.issue2_desc",
    gradient: "from-amber-400 to-orange-500",
    softBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    icon: <Hand className="w-6 h-6" />,
    href: "/bab/bakteri",
    titleField: "issue3_title" as const,
    titleKey: "landing.issue3_title",
    descField: "issue3_desc" as const,
    descKey: "landing.issue3_desc",
    gradient: "from-sky-400 to-blue-500",
    softBg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
];

export function RealWorldIssues({ settings }: { settings?: HomepageSettings }) {
  const { t } = useLangStore();
  const cta = settingsText(settings?.issues_cta) || t("landing.issues_cta");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
      {ISSUES.map((issue, i) => (
        <Link key={i} href={issue.href}>
          <motion.div
            className="group relative p-6 rounded-2xl bg-surface border border-border/50 shadow-card h-full overflow-hidden cursor-pointer"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${issue.gradient}`} />
            <div className={`w-12 h-12 ${issue.softBg} rounded-xl flex items-center justify-center mb-4 ${issue.iconColor}`}>
              {issue.icon}
            </div>
            <h3 className="font-bold text-ink mb-2 leading-snug">{settingsText(settings?.[issue.titleField]) || t(issue.titleKey)}</h3>
            <p className="text-sm text-muted leading-relaxed mb-4">{settingsText(settings?.[issue.descField]) || t(issue.descKey)}</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:gap-2.5 transition-all">
              {cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

export { Eyebrow };
