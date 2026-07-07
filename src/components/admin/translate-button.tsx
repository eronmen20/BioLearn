"use client";

import { useState } from "react";
import { Languages, Loader2, Check, AlertCircle } from "lucide-react";

interface TranslateButtonProps {
  /** Source bahasa: hanya 'id'|'en' supported by admin form default. */
  source: string;
  /** Target bahasa: hanya 'id'|'en' supported. */
  target: string;
  /** Text to translate. */
  text: string;
  /** Called with translated text. Should populate the target field. */
  onTranslated: (translated: string) => void;
  /** Optional: auto-extract first 4 chars for the button hover preview. */
  preview?: boolean;
  /** Custom className override. */
  className?: string;
  /** Disabled state (when source empty or already loading). */
  silentlySkipEmpty?: boolean;
}

type Status = "idle" | "loading" | "success" | "error";

/**
 * Reusable admin translate button. Renders a small 🌐 icon button next to a
 * bilingual field. Click → POST source text → /api/admin/translate (which
 * proxies MyMemory free API on the server side) → fills target field via
 * onTranslated callback.
 *
 * UI behavior:
 *   idle    → 🌍 icon, hover shows "Auto-translate ke EN"
 *   loading → animated spinner, disabled
 *   success → green ✓ briefly (1.4s) then revert to idle
 *   error   → red ⚠ briefly (1.4s) + toast with error message
 *
 * Why button-level vs form-level:
 *   Gives admin granular control — they pick which fields to autotranslate.
 *   For long HTML content, partial translate is also possible (admin can
 *   tweak the result inline).
 */
export function TranslateButton({
  source,
  target,
  text,
  onTranslated,
  className = "",
  silentlySkipEmpty = true,
}: TranslateButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const isEmpty = !text || !text.trim();

  async function handleClick() {
    if (isEmpty) {
      if (!silentlySkipEmpty) {
        // Light warning if admin wants it
        setStatus("error");
        setErrorMsg("Field kosong");
        setTimeout(() => setStatus("idle"), 1400);
      }
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: source, to: target }),
      });

      const json = await res.json();

      if (!res.ok || !json.translated) {
        throw new Error(json.error || "Terjemahan gagal");
      }

      onTranslated(json.translated);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1400);
    } catch (e) {
      setStatus("error");
      const msg = e instanceof Error ? e.message : "Terjemahan gagal";
      setErrorMsg(msg);
      setTimeout(() => setStatus("idle"), 2200);
    }
  }

  // Build dynamic label
  const targetLabel = target === "en" ? "EN" : "ID";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      title={
        status === "error" && errorMsg
          ? `Error: ${errorMsg}`
          : isEmpty
          ? `Isi field ${source.toUpperCase()} dulu untuk auto-translate`
          : `Auto-translate ${source.toUpperCase()} → ${targetLabel}`
      }
      className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all min-h-[28px] ${className} ${
        status === "loading"
          ? "bg-accent/15 text-accent cursor-wait"
          : status === "success"
          ? "bg-green-500/15 text-green-600"
          : status === "error"
          ? "bg-red-500/15 text-red"
          : isEmpty
          ? "bg-bg-alt text-muted-2 hover:bg-bg-alt hover:text-muted"
          : "bg-accent/10 text-accent hover:bg-accent hover:text-white hover:scale-105"
      }`}
    >
      {status === "loading" ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>...</span>
        </>
      ) : status === "success" ? (
        <>
          <Check className="w-3 h-3" />
          <span>✓</span>
        </>
      ) : status === "error" ? (
        <>
          <AlertCircle className="w-3 h-3" />
          <span>✗</span>
        </>
      ) : (
        <>
          <Languages className="w-3 h-3" />
          <span>Auto</span>
        </>
      )}
    </button>
  );
}

/**
 * Standalone hook version for cases where we already have the target setter.
 * Returns a callable + status.
 */
export function useTranslate() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const translate = async (
    text: string,
    source: string,
    target: string
  ): Promise<string | null> => {
    if (!text?.trim()) return null;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: source, to: target }),
      });
      const json = await res.json();
      if (!res.ok || !json.translated) throw new Error(json.error || "Terjemahan gagal");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1400);
      return json.translated;
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Terjemahan gagal");
      setTimeout(() => setStatus("idle"), 2200);
      return null;
    }
  };

  return { translate, status, errorMsg };
}
