"use client";

import { useEffect, useState } from "react";
import { BioNowDetail } from "@/components/sections/bionow-view";

export default function BioNowDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  if (!slug) return <div className="min-h-[80vh]" />;
  return <BioNowDetail key={slug} slug={slug} />;
}
