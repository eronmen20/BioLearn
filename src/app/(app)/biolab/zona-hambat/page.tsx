"use client";

import { ZoneSimulation } from "@/components/sections/zone-simulation";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function ZoneSimulationPage() {
  const mounted = useIsMounted();
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <ZoneSimulation />;
}
