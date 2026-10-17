// Media proxy allowlist helper — pure module so it is unit-testable.

const BASE_ALLOWED_HOSTS = [
  "raw.githubusercontent.com",
  "cdn.jsdelivr.net",
  "unpkg.com",
  "lottie.host",
  "assets.biolearn.id",
  "supabase.co", // supabase storage signed URLs
];

// LOCAL_DEV_ONLY_HOSTS are excluded in production to deny SSRF pivots into
// the runtime's own loopback services.
const LOCAL_DEV_ONLY_HOSTS = ["localhost", "127.0.0.1"];

export function isHostAllowed(hostname: string, nodeEnv: string = process.env.NODE_ENV || "development"): boolean {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  const baseAllowed = BASE_ALLOWED_HOSTS.includes(host);
  const devAllowed = !(nodeEnv === "production") && LOCAL_DEV_ONLY_HOSTS.includes(host);
  return baseAllowed || devAllowed;
}
