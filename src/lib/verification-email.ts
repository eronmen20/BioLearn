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
  const name = escapeHtml(opts.name || "");
  const intro = escapeHtml(opts.intro);
  const footnote = escapeHtml(opts.footNote);
  const preheader = `${intro} Kode: ${opts.code}`;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://biolearn.nyrea.xyz";
  const logoUrl = `${SITE_URL}/images/nyrea-logo.png`;
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#f4f2fc;word-break:break-word;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f2fc;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:440px;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#6c5ce7;border-radius:20px 20px 0 0;padding:26px 20px 20px;">
              <img src="${logoUrl}" width="76" height="56" alt="NYREA x BioLearn" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;max-width:100%;" />
              <div style="margin-top:6px;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:1px;">BioLearn</div>
              <div style="margin-top:4px;color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Belajar Biologi Jadi Seru</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:28px 28px 26px;">
              <p style="margin:0 0 6px;font-family:'Segoe UI',Arial,sans-serif;font-size:15px;color:#1a1a2e;font-weight:700;">Halo ${name}! <span>&#128075;</span></p>
              <p style="margin:0 0 22px;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;line-height:1.65;color:#555;">
                ${intro}
              </p>
              <p style="margin:0 0 8px;text-align:center;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9b96a9;">Kode verifikasimu</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#f0edff;border:1px dashed #c9c0f5;border-radius:14px;padding:14px 26px;">
                      <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:34px;font-weight:800;letter-spacing:9px;color:#6c5ce7;">${escapeHtml(opts.code)}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-top:14px;">
                    <div style="display:inline-block;background-color:#fff4e0;border-radius:999px;padding:6px 14px;">
                      <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;color:#b25e00;">&#9203;&#65039; Berlaku 10 menit</span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 0;padding-top:18px;border-top:1px solid #efecf7;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;line-height:1.7;color:#8a8694;">
                ${footnote}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#faf9ff;border-radius:0 0 20px 20px;padding:16px 24px;text-align:center;">
              <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:#a5a1b0;">
                BioLearn &bull; Platform Biologi Interaktif &mdash; email ini dikirim otomatis, mohon tidak dibalas.<br />
                Abaikan email ini jika kamu tidak merasa memintanya.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  await getResendClient().emails.send({
    from: RESEND_FROM,
    to: opts.email,
    subject: opts.subject,
    html,
  });
}
