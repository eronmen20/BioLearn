"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Newspaper, ArrowRight, ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

export interface BioNowPost {
  id: number;
  slug: string;
  badge: string;
  title_id: string;
  title_en: string;
  summary_id: string;
  summary_en: string;
  body_id: string;
  body_en: string;
  infographic_url: string;
  infographic_caption_id: string;
  infographic_caption_en: string;
  bab_id: string | null;
  sub_bab_key: string | null;
  tags: string[];
  published_at: string | null;
  sort_order: number;
}

function pick(post: BioNowPost, field: "title" | "summary" | "body", lang: string): string {
  const id = post[`${field}_id` as keyof BioNowPost] as string;
  const en = post[`${field}_en` as keyof BioNowPost] as string;
  return lang === "en" ? en || id : id || en;
}

function formatDate(iso: string | null, lang: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function materialHref(post: BioNowPost): string {
  if (!post.bab_id) return "/dashboard";
  return post.sub_bab_key
    ? `/bab/${post.bab_id}?sub=${encodeURIComponent(post.sub_bab_key)}`
    : `/bab/${post.bab_id}`;
}

/* ───────── Daftar post ───────── */

export function BioNowList() {
  const { lang } = useLangStore();
  const [posts, setPosts] = useState<BioNowPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/bionow", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (alive) {
          setPosts(data.posts || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-56 bg-border-light rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-56 bg-border-light rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-2xl sm:text-3xl">🌍</span>
          <h1 className="text-xl sm:text-2xl font-extrabold">BioNow</h1>
        </div>
        <p className="text-muted text-xs sm:text-sm">
          {lang === "en"
            ? "Real-world phenomena and current issues, explained scientifically and linked directly to your lessons."
            : "Fenomena dan isu terkini dunia nyata yang dijelaskan secara ilmiah dan terhubung langsung ke materimu."}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border/50 p-10 text-center">
          <Newspaper className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">
            {lang === "en" ? "No issues published yet. Check back soon!" : "Belum ada isu yang dipublikasikan. Cek lagi nanti!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {posts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.07, 0.4) }}
            >
              <Link href={`/bionow/${p.slug}`}>
                <div className="group relative bg-surface rounded-2xl shadow-card border border-border/50 overflow-hidden h-full hover:-translate-y-1 transition-transform">
                  {p.infographic_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.infographic_url} alt={pick(p, "title", lang)} className="w-full h-44 object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-accent/15 to-accent-2/10 flex items-center justify-center">
                      <Newspaper className="w-10 h-10 text-accent/50" />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                        {p.badge || "BioNow"}
                      </span>
                      {p.published_at && (
                        <span className="text-[11px] text-muted inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(p.published_at, lang)}
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-ink leading-snug mb-1.5 group-hover:text-accent transition-colors">
                      {pick(p, "title", lang)}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
                      {pick(p, "summary", lang)}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────── Detail post ───────── */

export function BioNowDetail({ slug }: { slug: string }) {
  const { lang } = useLangStore();
  const [post, setPost] = useState<BioNowPost | null>(null);
  const [related, setRelated] = useState<BioNowPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(`/api/bionow?slug=${encodeURIComponent(slug)}`, { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/bionow", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([detail, list]) => {
        if (!alive) return;
        if (detail.post) {
          setPost(detail.post);
          const others: BioNowPost[] = (list.posts || []).filter((p: BioNowPost) => p.slug !== slug);
          const sameBab = others.filter((p) => detail.post.bab_id && p.bab_id === detail.post.bab_id);
          const rest = others.filter((p) => !(detail.post.bab_id && p.bab_id === detail.post.bab_id));
          setRelated([...sameBab, ...rest].slice(0, 3));
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setLoading(false);
          setNotFound(true);
        }
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 bg-border-light rounded-xl" />
        <div className="h-56 bg-border-light rounded-2xl" />
        <div className="h-32 bg-border-light rounded-2xl" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted mb-4">{lang === "en" ? "Post not found." : "Postingan tidak ditemukan."}</p>
        <Link href="/bionow" className="text-accent font-semibold text-sm hover:underline">
          ← BioNow
        </Link>
      </div>
    );
  }

  const caption =
    lang === "en" ? post.infographic_caption_en || post.infographic_caption_id : post.infographic_caption_id || post.infographic_caption_en;

  return (
    <div className="animate-fade-in-up max-w-3xl mx-auto">
      <Link href="/bionow" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        BioNow
      </Link>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent/10 text-accent">
          {post.badge || "BioNow"}
        </span>
        {post.published_at && (
          <span className="text-[11px] text-muted inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(post.published_at, lang)}
          </span>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-ink leading-tight mb-3">
        {pick(post, "title", lang)}
      </h1>
      <p className="text-sm text-muted leading-relaxed mb-6">{pick(post, "summary", lang)}</p>

      {post.infographic_url && (
        <figure className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.infographic_url} alt={pick(post, "title", lang)} className="w-full rounded-2xl border border-border/50 shadow-card" />
          {caption && <figcaption className="text-[11px] text-muted text-center mt-2">{caption}</figcaption>}
        </figure>
      )}

      <div
        className="rich-text-content text-sm leading-relaxed text-muted space-y-3
          [&_h4]:text-accent-dark [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-1.5
          [&_p]:leading-relaxed [&_p]:my-2
          [&_strong]:text-ink [&_strong]:font-semibold
          [&_ul]:!list-disc [&_ul]:!pl-5 [&_ul]:!my-2.5 [&_ul]:!space-y-1.5
          [&_ol]:!list-decimal [&_ol]:!pl-5 [&_ol]:!my-2.5"
        dangerouslySetInnerHTML={{ __html: pick(post, "body", lang) }}
      />

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-6">
          {post.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-bg-alt border border-border/60 text-muted">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Tautan ke materi lengkap */}
      <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-white flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold flex-1">
          {lang === "en"
            ? "Understand the science behind this issue in the full lesson."
            : "Pahami sains di balik isu ini di materi lengkap."}
        </p>
        <Link
          href={materialHref(post)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-accent text-sm font-bold hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          {lang === "en" ? "Open lesson" : "Buka materi"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Terkait */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="font-bold text-ink mb-3">{lang === "en" ? "Related issues" : "Isu terkait"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link key={r.id} href={`/bionow/${r.slug}`}>
                <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-card h-full hover:-translate-y-0.5 transition-transform">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">{r.badge || "BioNow"}</p>
                  <p className="text-sm font-bold text-ink leading-snug line-clamp-2">{pick(r, "title", lang)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
