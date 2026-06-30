"use client";

import { useEffect, useState } from "react";
import { Dashboard } from "@/components/sections/dashboard";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <Dashboard />;
}
