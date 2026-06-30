"use client";

import { useEffect, useState } from "react";
import { ProgressView } from "@/components/sections/progress-view";

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <ProgressView />;
}