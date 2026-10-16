"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Tunggu hidrasi localStorage dulu — kalau tidak, refresh selalu
    // terlihat "belum login" dan user terlempar dari halaman admin.
    if (!_hydrated) return;
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [_hydrated, isAuthenticated, user, router]);

  if (!_hydrated || !isAuthenticated || (user && user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-red mx-auto mb-4 animate-pulse" />
          <p className="text-muted font-medium">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
