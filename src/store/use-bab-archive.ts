"use client";

import { useEffect, useState } from "react";

// Returns the set of bab IDs that are archived in the database.
//
// Default behavior: NOTHING archived (all visible) until the API confirms
// otherwise. This is the SAFE-WHEN-BROKEN default — if SQL migration hasn't
// been run yet, the is_archived column doesn't exist and the API returns
// empty rows, so we keep everything visible (no false-archive from a missing
// column). Once SQL is run AND admin flips a bab to archived, the API
// returns that flag and we hide it.
//
// For sensitive BAB-archived-but-DB-not-yet-migrated scenarios where you
// want the user view to FORCE only "active" babs to be visible (in case
// the admin already flipped them but SQL hasn't applied the column),
// you can layer this hook with a hardcoded fallback. BioLearn's current
// setup uses BOTH the hook + a defensive whitelist below for safety.
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
        // Only mark bab as archived if API explicitly says is_archived === true
        // AND is a boolean (guards against missing column case where row returned)
        const ids = new Set<string>();
        for (const b of json.bab || []) {
          if (b.is_archived === true) ids.add(b.id);
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

// Defensive whitelist — the only bab that BioLearn guarantees is live
// regardless of SQL migration state. Used as a hard fallback so that
// user-facing views (sidebar/dashboard/landing) NEVER flash all babs
// including rumored-inactive ones like "sirkulasi" / "syaraf" even
// when the archive API returns nothing (e.g., SQL not run yet).
//
// On first render, views should ONLY show babs in this whitelist.
// After archiveLoaded AND the API returns archivedIds that include a bab
// in this whitelist, we hide it.
//
// To keep a bab visible permanently, list it here. To remove it once
// fully-handled, leave it absent here and rely on DB-backed hide.
export const ALWAYS_VISIBLE_BABS = ["bakteri"];

