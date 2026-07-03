"use client";

import { showToast } from "@/components/ui/toaster";

export function toast(message: string) {
  showToast(message);
}

toast.success = (message: string) => showToast(`✅ ${message}`);
toast.error = (message: string) => showToast(`❌ ${message}`);
toast.info = (message: string) => showToast(`ℹ️ ${message}`);
toast.warning = (message: string) => showToast(`⚠️ ${message}`);
