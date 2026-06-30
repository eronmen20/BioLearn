"use client";

import { useProgressHydration } from "@/lib/progress-store";
import { useAuthHydration } from "@/lib/auth-store";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  useProgressHydration();
  useAuthHydration();
  return <>{children}</>;
}