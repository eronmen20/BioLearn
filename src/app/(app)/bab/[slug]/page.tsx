"use client";

import { useEffect, useState } from "react";
import { BabContent } from "@/components/sections/bab-view";
import { AuthGuard } from "@/components/auth/auth-guard";

// Force dynamic rendering: kill Vercel ISR cache + browser fresh fetch on every request.
// Without this, after admin edits Supabase, users see stale HTML unless they refresh 2x
// (first refresh invalidated browser cache, second finally invalidated Vercel ISR).
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function BabPage({ params }: { params: Promise<{ slug: string }> }) {
  const [mounted, setMounted] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => { setSlug(p.slug); setMounted(true); });
  }, [params]);

  if (!mounted || !slug) return <div className="min-h-[80vh]" />;
  return (
    <AuthGuard>
      <BabContent babId={slug} />
    </AuthGuard>
  );
}