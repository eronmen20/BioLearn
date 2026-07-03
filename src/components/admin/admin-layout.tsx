"use client";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminGuard } from "@/components/admin/admin-guard";
import { Toaster } from "@/components/ui/toaster";
import { StoreHydrator } from "@/components/layout/store-hydrator";
import { usePathname } from "next/navigation";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Login page: no guard, no sidebar, no header
  if (isLoginPage) {
    return (
      <StoreHydrator>
        {children}
        <Toaster />
      </StoreHydrator>
    );
  }

  // Protected admin pages: full layout with guard
  return (
    <StoreHydrator>
      <AdminGuard>
        <AdminHeader />
        <AdminSidebar />
        <main className="ml-0 lg:ml-[260px] mt-14 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 min-h-[calc(100vh-56px)] bg-bg">
          {children}
        </main>
        <Toaster />
      </AdminGuard>
    </StoreHydrator>
  );
}
