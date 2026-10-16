"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BabContent } from "@/components/sections/bab-view";
import { AuthGuard } from "@/components/auth/auth-guard";

// Deep link ?sub=<sub_bab_key> — mis. dari kartu isu di landing.
// useSearchParams wajib di dalam <Suspense>.
function BabContentWithSub({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  return <BabContent babId={slug} initialSubKey={searchParams.get("sub")} />;
}

export default function BabPage({ params }: { params: Promise<{ slug: string }> }) {
  const [mounted, setMounted] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => { setSlug(p.slug); setMounted(true); });
  }, [params]);

  if (!mounted || !slug) return <div className="min-h-[80vh]" />;
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-[80vh]" />}>
        <BabContentWithSub slug={slug} />
      </Suspense>
    </AuthGuard>
  );
}
