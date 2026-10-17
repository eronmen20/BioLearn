import { NextRequest, NextResponse } from "next/server";
import { getProgress, saveProgress, findUserByEmail } from "@/lib/db";
import { verifyUserToken } from "@/lib/admin-auth";
import { extractUserToken } from "@/lib/user-token";
import { isOwnerEmail } from "@/lib/tokens";

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      return originUrl.host === host;
    } catch {
      return false;
    }
  }
  const referer = req.headers.get("referer");
  if (referer && host) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }
  return true;
}

function getSessionOwner(req: NextRequest) {
  const token = extractUserToken(req);
  const payload = token ? verifyUserToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized: silakan login kembali" }, { status: 401 });
  }
  return { email: payload.email, role: payload.role };
}

// SECURITY: previously ANY caller (or nobody at all) could read/write any
// user's progress by submitting an arbitrary ?email= parameter — full IDOR
// and score forgery. Now every request must carry a valid signed session
// cookie (biolearn_token) and ask for data belonging to the token's OWN
// email. Admins inspect progress data via the admin API, not this route.
export async function GET(req: NextRequest) {
  try {
    const session = getSessionOwner(req);
    if (session instanceof NextResponse) return session;

    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    if (!isOwnerEmail(session.email, email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await findUserByEmail(session.email);
    if (!user) {
      // Session token refers to a no-longer-existing account — treat as invalid.
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const progress = await getProgress(user.id);
    return NextResponse.json({ progress });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const session = getSessionOwner(req);
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const { email, babId, data } = body ?? {};

    if (!email || !babId || !data) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    if (typeof email !== "string" || typeof babId !== "string" || babId.length > 100) {
      return NextResponse.json({ error: "Data progres tidak valid" }, { status: 400 });
    }

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return NextResponse.json({ error: "Data progres tidak valid" }, { status: 400 });
    }

    if (!isOwnerEmail(session.email, email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await findUserByEmail(session.email);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    await saveProgress(user.id, babId, data);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
