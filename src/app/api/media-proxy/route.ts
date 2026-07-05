// Server-side SVG/media proxy.
// Why: external CDNs often (a) block CORS, (b) send Content-Type: text/plain
// instead of image/svg+xml which makes browsers refuse <object>/inline
// rendering, (c) don't ship correct caching. This proxy normalizes all
// three so animated SVGs always render.
//
// Use: GET /api/media-proxy?url=<encoded remote URL>
import { NextRequest, NextResponse } from "next/server";

// Public CDN allowlist — anything outside this list is rejected to prevent
// SSRF (Server-Side Request Forgery) abuse of our Vercel compute.
const ALLOWED_HOSTS = [
  "raw.githubusercontent.com",
  "cdn.jsdelivr.net",
  "unpkg.com",
  "lottie.host",
  "assets.biolearn.id",
  "supabase.co", // supabase storage signed URLs
  "localhost", // local dev
  "127.0.0.1",
];

// Hard cap so proxy can't be used to exfiltrate huge files.
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const REQUEST_TIMEOUT_MS = 15000;

// Map URL/path → guaranteed-correct Content-Type.
// Fixes most common Cici bugs where external server returns text/plain
// for an SVG and browser refuses to render it.
function resolveContentType(targetUrl: string, upstreamType: string | null): string {
  const path = (() => {
    try {
      return new URL(targetUrl).pathname.toLowerCase();
    } catch {
      return targetUrl.toLowerCase();
    }
  })();

  if (path.endsWith(".svg") || path.includes(".svg?")) return "image/svg+xml; charset=utf-8";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".gif")) return "image/gif";

  // Fall through to upstream header if extension doesn't tell us anything.
  // Strip parameters like "text/plain; charset=utf-8".
  if (upstreamType && !/text\/plain/i.test(upstreamType)) {
    return upstreamType.split(";")[0].trim();
  }
  return "application/octet-stream";
}

// Server-side XSS sanitizer for SVG markup.
// Even though we trust upstream hosts, defence-in-depth: if anyone ever
// points this at an untrusted host, we still don't execute foreign scripts.
function sanitizeSvg(svg: string): string {
  return svg
    // Strip <script>…</script> blocks (incl. by attribute lookup).
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<script[^>]*\/?>/gi, "")
    // Strip event-handler attributes (onload=, onclick=, on*=, etc).
    .replace(/\son[a-z]+\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+)/gi, "")
    // Strip foreignObject — could embed unsanitized HTML.
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    // Strip <iframe> and <embed> for safety.
    .replace(/<\/?(iframe|embed|object)\b[^>]*>/gi, "")
    // Strip javascript: / vbscript: URLs in href/xlink:href.
    .replace(/(href|xlink:href)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, "")
    .replace(/(href|xlink:href)\s*=\s*("vbscript:[^"]*"|'vbscript:[^']*'|vbscript:[^\s>]+)/gi, "");
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "url query param required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // SSRF guard: only proxy approved hosts. Production deployments should
  // extend this list or load from env.
  if (!ALLOWED_HOSTS.includes(target.hostname)) {
    return NextResponse.json(
      { error: `Host '${target.hostname}' not allowed. Allowed: ${ALLOWED_HOSTS.join(", ")}` },
      { status: 403 }
    );
  }

  // Only http/https allowed (URL ctor already enforces this; defensive double-check).
  if (!/^https?:$/.test(target.protocol)) {
    return NextResponse.json({ error: "Only http/https URLs allowed" }, { status: 400 });
  }

  // Fetch upstream with timeout + size cap.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Send a polite UA + Accept so upstream CDN doesn't 406 us.
        "User-Agent": "BioLearn-MediaProxy/1.0",
        Accept: "image/*,*/*;q=0.8",
      },
    });
  } catch (e) {
    clearTimeout(timeoutId);
    const isTimeout = e instanceof Error && /abort|timeout/i.test(e.message);
    return NextResponse.json(
      { error: isTimeout ? "Upstream timeout" : `Fetch failed: ${(e as Error).message}` },
      { status: 502 }
    );
  }
  clearTimeout(timeoutId);

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream ${upstream.status} ${upstream.statusText}` },
      { status: 502 }
    );
  }

  // Enforce size cap.
  const contentLength = upstream.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BYTES) {
    return NextResponse.json({ error: "Upstream file too large" }, { status: 413 });
  }

  const buf = Buffer.from(await upstream.arrayBuffer());
  if (buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Upstream file too large" }, { status: 413 });
  }

  const upstreamType = upstream.headers.get("content-type");
  const contentType = resolveContentType(target.toString(), upstreamType);

  // If this is an SVG, sanitize and return raw text. Otherwise return bytes.
  const isSvg = /image\/svg\+xml/i.test(contentType);

  let body: string | Buffer = buf;
  if (isSvg) {
    const raw = buf.toString("utf-8");
    body = sanitizeSvg(raw);
    if (!/<svg[\s\S]*<\/svg>/i.test(body) && !/<svg\b[^>]*\/?>/i.test(body)) {
      return NextResponse.json(
        { error: "Upstream returned content but it isn't valid SVG markup" },
        { status: 502 }
      );
    }
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(
        typeof body === "string" ? Buffer.byteLength(body, "utf-8") : body.byteLength
      ),
      // Permissive CORS so <object> / inline fetch can use it from any origin.
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Biolearn-Proxy": "1",
    },
  });
}

// CORS preflight (some browsers send OPTIONS before GET).
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
