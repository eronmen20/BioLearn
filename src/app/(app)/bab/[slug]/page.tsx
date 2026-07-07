"use client";

import { useEffect, useState } from "react";
import { BabContent } from "@/components/sections/bab-view";
import { AuthGuard } from "@/components/auth/auth-guard";

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
