"use client";

import { BioLabList } from "@/components/sections/biolab-view";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function BioLabPage() {
  const mounted = useIsMounted();
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <BioLabList />;
}
