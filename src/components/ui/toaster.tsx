"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

let toastListeners: Array<(msg: string) => void> = [];

export function showToast(msg: string) {
  toastListeners.forEach((fn) => fn(msg));
}

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fn = (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), 3000);
    };
    toastListeners.push(fn);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== fn);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in-up">
      <div className="bg-ink text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3">
        <span>{message}</span>
        <button onClick={() => setMessage(null)} className="text-white/60 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}