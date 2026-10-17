"use client";

import { VirtualMicroscopeSimulation } from "@/components/sections/microscope-simulation";
import { useIsMounted } from "@/lib/use-is-mounted";

export default function VirtualMicroscopePage() {
  const mounted = useIsMounted();
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <VirtualMicroscopeSimulation />;
}
