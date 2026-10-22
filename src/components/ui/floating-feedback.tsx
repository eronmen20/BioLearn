"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareHeart, X, Send, CheckCircle2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useLangStore } from "@/lib/lang-store";

const EMOJIS = [
  { rating: 1, emoji: "😡", labelId: "Buruk", labelEn: "Poor" },
  { rating: 2, emoji: "🙁", labelId: "Kurang", labelEn: "Fair" },
  { rating: 3, emoji: "😐", labelId: "Cukup", labelEn: "Good" },
  { rating: 4, emoji: "😊", labelId: "Bagus", labelEn: "Great" },
  { rating: 5, emoji: "🤩", labelId: "Keren!", labelEn: "Awesome!" },
];

const CATEGORIES = [
  { id: "general", labelId: "💬 Umum", labelEn: "💬 General" },
  { id: "bug", labelId: "🐛 Bug/Error", labelEn: "🐛 Bug/Issue" },
  { id: "feature", labelId: "💡 Saran", labelEn: "💡 Suggestion" },
  { id: "content", labelId: "📖 Materi", labelEn: "📖 Content" },
];

export function FloatingFeedback() {
  const user = useAuthStore((s) => s.user);
  const { lang } = useLangStore();

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>("general");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg(lang === "en" ? "Please write a short message." : "Tuliskan masukan singkatmu ya.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          message,
          name: user?.name || "Anonim",
          email: email || user?.email || null,
          pageUrl: typeof window !== "undefined" ? window.location.pathname : "/",
          source: "floating-widget",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (lang === "en" ? "Failed to send feedback." : "Gagal mengirim feedback."));
      }

      setSubmitted(true);
      setMessage("");
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || (lang === "en" ? "Failed to send." : "Gagal mengirim."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger - Icon only, expands "Feedback" on hover */}
      <div className="fixed bottom-18 sm:bottom-20 right-4 z-40 flex items-center justify-end">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.92 }}
          className="group relative flex items-center justify-center h-11 rounded-full bg-accent text-white shadow-xl hover:bg-accent-dark transition-all duration-300 border border-white/20 px-3 cursor-pointer overflow-hidden"
          aria-label="Feedback"
          title={lang === "en" ? "Send Feedback" : "Beri Feedback"}
        >
          {isOpen ? (
            <X className="w-5 h-5 flex-shrink-0" />
          ) : (
            <MessageSquareHeart className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
          )}
          <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-[80px] group-hover:opacity-100 group-hover:ml-1.5 transition-all duration-300 text-xs font-semibold">
            Feedback
          </span>
        </motion.button>
      </div>

      {/* Floating Modal / Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-32 sm:bottom-34 right-4 z-50 w-[92vw] sm:w-[380px] max-h-[75vh] overflow-y-auto rounded-3xl bg-surface border border-border shadow-2xl p-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink">
                    {lang === "en" ? "Send Feedback" : "Beri Feedback"}
                  </h4>
                  <p className="text-[11px] text-muted">
                    {lang === "en" ? "Help us improve & expand this platform" : "Bantu kami perbaiki & lengkapi web ini"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors"
                aria-label={lang === "en" ? "Close" : "Tutup"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h5 className="text-base font-bold text-ink">
                  {lang === "en" ? "Thank You!" : "Terima Kasih!"}
                </h5>
                <p className="text-xs text-muted mt-1">
                  {lang === "en" ? "Your feedback means a lot to us." : "Masukanmu sangat berarti bagi kami."}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Emoji Rating */}
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    {lang === "en" ? "How satisfied are you?" : "Seberapa puas kamu?"}
                  </label>
                  <div className="flex justify-between items-center bg-surface-2 p-2 rounded-2xl border border-border/50">
                    {EMOJIS.map((e) => (
                      <button
                        key={e.rating}
                        type="button"
                        onClick={() => setRating(e.rating)}
                        className={`flex flex-col items-center p-1.5 rounded-xl transition-all ${
                          rating === e.rating
                            ? "bg-accent/15 scale-110 shadow-sm"
                            : "hover:bg-border/30 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <span className="text-2xl leading-none">{e.emoji}</span>
                        <span className="text-[10px] text-muted font-medium mt-1">
                          {lang === "en" ? e.labelEn : e.labelId}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    {lang === "en" ? "Category" : "Kategori"}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          category === c.id
                            ? "bg-accent text-white"
                            : "bg-surface-2 text-ink/80 border border-border/60 hover:bg-border/50"
                        }`}
                      >
                        {lang === "en" ? c.labelEn : c.labelId}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    {lang === "en" ? "Feedback / Suggestion / Issue" : "Kritik / Saran / Kendala"} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={lang === "en" ? "Write your experience or any issues you found..." : "Tuliskan pengalaman atau kendala yang kamu temukan..."}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-2 border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink resize-none"
                  />
                </div>

                {/* Optional Email */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === "en" ? "Your email (optional, if you'd like a reply)" : "Email kamu (opsional, jika ingin dihubungi)"}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-2 border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink"
                  />
                </div>

                {errorMsg && <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "Submit Feedback" : "Kirim Feedback"}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
