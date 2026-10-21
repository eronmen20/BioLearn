"use client";

import { useEffect, useState } from "react";

export interface ActiveBanner {
  id: number;
  judul: string;
  deskripsi: string;
  posisi: string;
  status: string;
  image_url?: string | null;
  link_url?: string | null;
  sort_order: number;
  created_at: string;
}

export function useActiveBanners(posisi?: string) {
  const [banners, setBanners] = useState<ActiveBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const url = posisi
      ? `/api/banners?posisi=${encodeURIComponent(posisi)}&_t=${Date.now()}`
      : `/api/banners?_t=${Date.now()}`;

    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive) setBanners(d.banners || []);
      })
      .catch(() => {
        if (alive) setBanners([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [posisi]);

  return { banners, loading };
}
