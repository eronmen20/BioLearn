"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Tunggu hidrasi dulu supaya refresh tidak menendang user ke /login
    if (!_hydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [_hydrated, isAuthenticated, router]);

  if (!_hydrated || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">🔒</div>
          <p className="text-muted">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}