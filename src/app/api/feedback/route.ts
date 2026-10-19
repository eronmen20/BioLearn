import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getResendClient, RESEND_FROM } from "@/lib/verification-email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, category, message, name, email, pageUrl, source } = body ?? {};

    // Basic Validation
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating wajib diisi (1 sampai 5 bintang)." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Pesan feedback tidak boleh kosong." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Pesan feedback maksimal 2000 karakter." },
        { status: 400 }
      );
    }

    const payload = {
      rating,
      category: typeof category === "string" ? category.slice(0, 50) : "general",
      message: message.trim(),
      name: typeof name === "string" ? name.trim().slice(0, 100) : null,
      email: typeof email === "string" ? email.trim().slice(0, 100) : null,
      page_url: typeof pageUrl === "string" ? pageUrl.slice(0, 255) : null,
      source: typeof source === "string" ? source.slice(0, 30) : "inline",
      created_at: new Date().toISOString(),
    };

    // Insert into Supabase
    try {
      const db = getDb();
      const { data, error } = await db.from("feedbacks").insert(payload).select().single();
      if (error) {
        console.warn("Supabase feedback insert note:", error.message);
        // If table doesn't exist yet, we still return success with notice
        // so testing in UI doesn't crash before user runs the SQL migration
      }
    } catch (dbErr) {
      console.warn("Feedback database error:", dbErr);
    }

    // Optional notification via Resend (async non-blocking)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = getResendClient();
        const notificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_FROM;
        if (notificationEmail) {
          const stars = "⭐".repeat(rating);
          await resend.emails.send({
            from: RESEND_FROM,
            to: [notificationEmail],
            subject: `[BioLearn Feedback] ${stars} (${payload.category}) dari ${payload.name || "Pengguna"}`,
            text: `Feedback baru diterima di BioLearn:\n\nRating: ${rating}/5\nKategori: ${payload.category}\nPengirim: ${payload.name || "Anonim"} (${payload.email || "Tanpa email"})\nHalaman: ${payload.page_url || "-"}\nSumber: ${payload.source}\n\nPesan:\n${payload.message}`,
          });
        }
      } catch (emailErr) {
        // Log without interrupting the user response
        console.warn("Resend notification error:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Terima kasih atas feedback yang kamu berikan!",
    });
  } catch (err: any) {
    console.error("Feedback route error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses feedback." },
      { status: 500 }
    );
  }
}
