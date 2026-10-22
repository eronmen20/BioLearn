"use client";

import { BiochemLabView } from "@/components/biochem/biochem-lab-view";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function BiochemLabPage() {
  const mounted = useIsMounted();
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <BiochemLabView />;
}
