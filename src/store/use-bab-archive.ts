"use client";

import { useEffect, useState } from "react";

// Returns the set of bab IDs that are archived in the database.
// Hydrates AFTER mount to avoid hydration mismatch with hardcoded
// bab-data.ts (which lists all bab regardless of archive status).
//
// Usage:
//   const { archivedIds, loaded } = useBabArchiveIds();
//   const visibleBabs = BAB.filter(b => !archivedIds.has(b.id));
//
export function useBabArchiveIds() {
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/bab?include_archived=true&_t=${Date.now()}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        const json = await res.json();
        if (!alive) return;
        const ids = new Set<string>();
        for (const b of json.bab || []) {
          if (b.is_archived) ids.add(b.id);
        }
        setArchivedIds(ids);
      } catch {
        // Soft fail — keep empty set, all bab visible (safe default)
      } finally {
        if (alive) setLoaded(true);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  return { archivedIds, loaded };
}
