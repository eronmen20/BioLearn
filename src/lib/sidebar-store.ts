"use client";

import { create } from "zustand";

interface SidebarState {
  /** Visibilitas sidebar di layar lebar (md+). Bisa ditutup walau window fullscreen. */
  open: boolean;
  /** Overlay sidebar di layar kecil (<md). */
  mobileOpen: boolean;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setMobileOpen: (mobileOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  open: true,
  mobileOpen: false,
  toggleOpen: () => set((s) => ({ open: !s.open })),
  setOpen: (open) => set({ open }),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}));
