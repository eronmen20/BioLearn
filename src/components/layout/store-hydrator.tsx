"use client";

import { useProgressHydration } from "@/lib/progress-store";
import { useAuthHydration } from "@/lib/auth-store";
import { useThemeHydration } from "@/lib/theme-store";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  useProgressHydration();
  useAuthHydration();
  useThemeHydration();
  return <>{children}</>;
}
