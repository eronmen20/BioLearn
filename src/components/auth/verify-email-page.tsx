"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLangStore } from "@/lib/lang-store";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Mail } from "lucide-react";

export function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { t } = useLangStore();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-send code on mount
  useEffect(() => {
    if (email) {
      handleSendCode();
    }
  }, []);

  const handleSendCode = async () => {
    if (!email) return;
    try {
      await fetch("/api/auth/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendTimer(60);
      setCanResend(false);
    } catch {
      // silent
    }
  };

  const handleResend = async () => {
    await handleSendCode();
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.querySelector(`input[name="code-${index + 1}"]`) as HTMLInputElement;
      next?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every((d) => d !== "") && index === 5) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.querySelector(`input[name="code-${index - 1}"]`) as HTMLInputElement;
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (verifyCode: string) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verifyCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verifikasi gagal");
        setCode(["", "", "", "", "", ""]);
        const first = document.querySelector('input[name="code-0"]') as HTMLInputElement;
        first?.focus();
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Email tidak ditemukan. Silakan daftar terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-3xl shadow-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green" />
            </div>
            <h1 className="text-xl font-extrabold mb-2">Verifikasi Berhasil!</h1>
            <p className="text-muted text-sm">Email kamu sudah terverifikasi. Mengalihkan ke halaman login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-3xl shadow-xl border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Verifikasi Email</h1>
            <p className="text-muted text-sm">
              Masukkan kode 6 digit yang dikirim ke
            </p>
            <p className="text-accent font-semibold text-sm mt-1">{email}</p>
          </div>

          {error && (
            <div className="bg-red/10 border border-red text-red rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-3 mb-6">
            {code.map((digit, i) => (
              <input
                key={i}
                name={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-border rounded-xl outline-none focus:border-accent-light transition-colors bg-surface disabled:opacity-50"
              />
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span className="text-sm text-muted">Memverifikasi...</span>
            </div>
          )}

          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-accent font-semibold hover:underline"
              >
                Kirim ulang kode
              </button>
            ) : (
              <p className="text-sm text-muted-2">
                Kirim ulang dalam {resendTimer} detik
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
