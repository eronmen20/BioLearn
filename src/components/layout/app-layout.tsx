"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { StoreHydrator } from "@/components/layout/store-hydrator";
import { useSidebarStore } from "@/lib/sidebar-store";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useSidebarStore((s) => s.open);

  return (
    <>
      <Header />
      <Sidebar />
      <main
        className={`ml-0 ${sidebarOpen ? "md:ml-[260px]" : "md:ml-0"} md:transition-[margin] md:duration-300 mt-16 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-8 min-h-[calc(100vh-64px)]`}
      >
        <StoreHydrator>
          {children}
        </StoreHydrator>
      </main>
      <Toaster />
    </>
  );
}
