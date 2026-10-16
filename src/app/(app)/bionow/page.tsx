"use client";

import { BioNowList } from "@/components/sections/bionow-view";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function BioNowPage() {
  const mounted = useIsMounted();
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <BioNowList />;
}
