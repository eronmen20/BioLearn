"use client";

import { Suspense } from "react";
import { VerifyEmailPage } from "@/components/auth/verify-email-page";

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-4">🧬</div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailPage />
    </Suspense>
  );
}
