"use client";

import { useEffect, useState } from "react";
import { GlossaryView } from "@/components/sections/glossary-view";

export default function GlossaryPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <GlossaryView />;
}