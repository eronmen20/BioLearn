"use client";

import { useState } from "react";
import { useLangStore } from "@/lib/lang-store";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, KeyRound, Mail, CheckCircle } from "lucide-react";

type Step = "email" | "code" | "new_password" | "done";

export function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLangStore();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer for resend
  const startTimer = () => {
    setResendTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendEmail = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setStep("code");
        startTimer();
      }
    } catch {
      setError(t("auth.server_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d+$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");
    if (value && index < 5) {
      const next = document.querySelector(`input[name="fcode-${index + 1}"]`) as HTMLInputElement;
      next?.focus();
    }
    if (newCode.every((d) => d !== "") && index === 5) {
      setStep("new_password");
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.querySelector(`input[name="fcode-${index - 1}"]`) as HTMLInputElement;
      prev?.focus();
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (newPassword.length < 6) {
      setError(t("auth.password_min"));
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.join(""), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setStep("done");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError(t("auth.server_error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-3xl shadow-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green" />
            </div>
            <h1 className="text-xl font-extrabold mb-2">{t("auth.password_changed")}</h1>
            <p className="text-muted text-sm">{t("auth.redirect_login")}</p>
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
              <KeyRound className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">
              {step === "email" && t("auth.forgot_title")}
              {step === "code" && t("auth.enter_code")}
              {step === "new_password" && t("auth.new_password")}
            </h1>
            <p className="text-muted text-sm">
              {step === "email" && t("auth.forgot_desc")}
              {step === "code" && t("auth.code_sent_to").replace("{email}", email)}
              {step === "new_password" && t("auth.new_password_desc")}
            </p>
          </div>

          {error && (
            <div className="bg-red/10 border border-red text-red rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.email_placeholder")}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl text-sm outline-none focus:border-accent-light transition-colors bg-surface"
                  />
                </div>
              </div>
              <button
                onClick={handleSendEmail}
                disabled={isLoading || !email}
                className="w-full py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("auth.send_code")}
              </button>
            </div>
          )}

          {step === "code" && (
            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    name={`fcode-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-border rounded-xl outline-none focus:border-accent-light transition-colors bg-surface"
                  />
                ))}
              </div>
              <div className="text-center">
                {canResend ? (
                  <button onClick={async () => { setError(""); setIsLoading(true); await fetch("/api/auth/forgot-password/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); startTimer(); setIsLoading(false); }} className="text-sm text-accent font-semibold hover:underline">
                    {t("auth.resend_code")}
                  </button>
                ) : (
                  <p className="text-sm text-muted-2">{t("auth.resend_in").replace("{seconds}", String(resendTimer))}</p>
                )}
              </div>
            </div>
          )}

          {step === "new_password" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">{t("auth.new_password")}</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("auth.password_placeholder")}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 border-2 border-border rounded-xl text-sm outline-none focus:border-accent-light transition-colors bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-muted"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={isLoading || newPassword.length < 6}
                className="w-full py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("auth.reset_password")}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => router.push("/login")} className="text-sm text-accent font-semibold hover:underline">
              {t("auth.back_to_login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
