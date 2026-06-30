"use client";

import { useEffect, useState } from "react";
import { LoginPage } from "@/components/auth/login-page";

export default function LoginRoute() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-[80vh]" />;
  return <LoginPage />;
}