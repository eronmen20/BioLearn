import { Resend } from "resend";

// Shared email-verification-code email helper (verify/send, forgot/send,
// register). Kept in one place so subject/copy/security stay consistent.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getResendClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface SendCodeEmailOptions {
  email: string;
  name: string;
  code: string;
  subject: string;
  intro: string;
  footNote: string;
}

// Sender address. RESEND_FROM is optional and only needed once a real domain
// is verified in Resend (e.g. "BioLearn <no-reply@nyrea.xyz>"). Without a
// verified domain, Resend only delivers to the account owner's email.
export const RESEND_FROM = process.env.RESEND_FROM || "BioLearn <onboarding@resend.dev>";

export async function sendCodeEmail(opts: SendCodeEmailOptions): Promise<void> {
  await getResendClient().emails.send({
    from: RESEND_FROM,
    to: opts.email,
    subject: opts.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6c5ce7; text-align: center;">🧬 BioLearn</h2>
        <p style="font-size: 14px; color: #333;">Halo <b>${escapeHtml(opts.name || "")}</b>,</p>
        <p style="font-size: 14px; color: #333;">${escapeHtml(opts.intro)}</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6c5ce7; background: #f0edff; padding: 12px 24px; border-radius: 12px;">${opts.code}</span>
        </div>
        <p style="font-size: 12px; color: #999; text-align: center;">Kode ini berlaku selama 10 menit.</p>
        <p style="font-size: 12px; color: #999; text-align: center;">${escapeHtml(opts.footNote)}</p>
      </div>
    `,
  });
}
