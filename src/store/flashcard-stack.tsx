"use client";

import { useState, useEffect, useRef } from "react";
import { useLangStore } from "@/lib/lang-store";
import { Eye, EyeOff, RefreshCw, ChevronLeft, ChevronRight, Award, Loader2 } from "lucide-react";

interface FlashCard {
  id: number;
  bab_id: string;
  sub_bab_key: string;
  front_id: string;
  front_en: string;
  back_id: string;
  back_en: string;
}

export function FlashcardStack({ babId, subBabKey }: { babId: string; subBabKey: string }) {
  const { lang } = useLangStore();
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const loadTokenRef = useRef(0);

  useEffect(() => {
    if (!babId || !subBabKey) return;
    setLoading(true);
    setIdx(0);
    setFlipped(false);

    const myToken = ++loadTokenRef.current;
    const loadCards = async () => {
      try {
        const url = `/api/flashcard?bab_id=${encodeURIComponent(babId)}&sub_bab_key=${encodeURIComponent(subBabKey)}&_t=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        if (myToken !== loadTokenRef.current) return; // race guard
        const json = await res.json();
        if (myToken !== loadTokenRef.current) return;
        setCards(json.cards || []);
      } catch {
        if (myToken !== loadTokenRef.current) return;
        setCards([]);
      } finally {
        if (myToken === loadTokenRef.current) setLoading(false);
      }
    };
    loadCards();

    return () => {
      loadTokenRef.current++;
    };
  }, [babId, subBabKey]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border p-5 bg-gradient-to-br from-yellow-50/40 to-amber-50/30 dark:from-yellow-900/10 dark:to-amber-900/10 animate-pulse">
        <div className="h-4 w-32 bg-border/50 rounded mb-3" />
        <div className="h-40 bg-border/40 rounded-xl" />
      </div>
    );
  }

  if (cards.length === 0) return null;

  const card = cards[idx];
  const front = lang === "en" ? card.front_en || card.front_id : card.front_id;
  const back = lang === "en" ? card.back_en || card.back_id : card.back_id;
  const known = knownCount;
  const remaining = cards.length - known;
  const allDone = known >= cards.length;

  const handlePrev = () => {
    setFlipped(false);
    setIdx((i) => (i === 0 ? cards.length - 1 : i - 1));
  };
  const handleNext = () => {
    setFlipped(false);
    setIdx((i) => (i === cards.length - 1 ? 0 : i + 1));
  };
  const handleKnow = () => {
    setKnownCount((c) => c + 1);
    setFlipped(false);
    setTimeout(() => handleNext(), 200);
  };

  if (allDone) {
    return (
      <div className="rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 text-center">
        <Award className="w-12 h-12 mx-auto mb-2 text-green-600" />
        <h3 className="font-bold text-lg text-ink mb-1">🎉 Selesai!</h3>
        <p className="text-sm text-muted mb-4">Tandai semua {cards.length} flashcard sebagai sudah dikuasai.</p>
        <button
          onClick={() => { setKnownCount(0); setIdx(0); setFlipped(false); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Ulangi lagi
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-yellow-50/40 to-amber-50/30 dark:from-yellow-900/10 dark:to-amber-900/10 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📇</span>
          <h3 className="font-bold text-sm text-ink">Flashcard</h3>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700">
          {idx + 1} / {cards.length} · ✓{known}
        </span>
      </div>

      {/* Card */}
      <div
        className="relative h-40 sm:h-48 cursor-pointer select-none [perspective:1000px]"
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
          {/* Front */}
          <div className="absolute inset-0 bg-white dark:bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col items-center justify-center [backface-visibility:hidden]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mb-2">Pertanyaan</span>
            <p className="text-sm sm:text-base font-semibold text-ink text-center leading-relaxed line-clamp-5">
              {front}
            </p>
            <div className="absolute bottom-2 right-3 text-[10px] text-muted inline-flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Tap untuk lihat jawaban
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 rounded-xl border border-accent/30 p-4 sm:p-5 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent mb-2">Jawaban</span>
            <p className="text-sm sm:text-base text-ink text-center font-medium leading-relaxed line-clamp-5">
              {back}
            </p>
            <div className="absolute bottom-2 right-3 text-[10px] text-muted inline-flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              Tap untuk kembali
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl border border-border hover:bg-bg-alt text-muted hover:text-ink transition-colors"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleKnow}
          className="flex-1 px-3 py-2 rounded-xl bg-green-500 text-white text-xs sm:text-sm font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <Award className="w-4 h-4" />
          Tandai tahu
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="px-3 py-2 rounded-xl border border-border hover:bg-bg-alt text-muted hover:text-accent text-xs sm:text-sm font-medium transition-colors"
        >
          {flipped ? "←" : "→"}
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-xl border border-border hover:bg-bg-alt text-muted hover:text-ink transition-colors"
          title="Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
