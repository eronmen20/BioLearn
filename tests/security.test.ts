// BioLearn security regression suite.
// Run: npm test   (node --experimental-strip-types --test)
// Adds no new dependencies — uses the built-in node:test runner.
import "./env.ts";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = (await import("node:test")).default;

const adminAuth = await import("@/lib/admin-auth");
const { verifyToken, generateToken, isOwnerEmail, TOKEN_TTL_MS, encodePayload, decodePayload, timingSafeBytesEqual } =
  await import("@/lib/tokens");
const { isHostAllowed } = await import("@/lib/media-allowlist");
const { isValidUserRole, VALID_USER_ROLES } = await import("@/lib/user-roles");

const crypto = await import("node:crypto");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = (rel: string) => readFileSync(path.join(root, rel.replace(/^\//, "")), "utf8");

void TOKEN_TTL_MS;

// ---------------------------------------------------------------- HMAC tokens

run("tokens: generated token verifies with matching type", async () => {
  for (const type of ["access", "refresh", "user"] as const) {
    const token = await generateToken("User@BioLearn.TEST", "user", type);
    const payload = await verifyToken(token);
    assert.ok(payload);
    assert.equal(payload!.email, "User@BioLearn.TEST");
    assert.equal(payload!.type, type);
  }
});

run("tokens: allowedTypes is enforced (fail closed)", async () => {
  const access = await adminAuth.generateAccessToken("a@b.c", "admin");
  const refresh = await adminAuth.generateRefreshToken("a@b.c", "admin");
  const user = await adminAuth.generateUserToken("a@b.c", "user");

  assert.ok(await verifyToken(access, ["access"]));
  assert.ok(await verifyToken(refresh, ["refresh"]));
  assert.ok(await verifyToken(user, ["user"]));

  assert.equal(await verifyToken(access, ["refresh"]), null);
  assert.equal(await verifyToken(access, ["user"]), null);
  assert.equal(await verifyToken(refresh, ["access"]), null);
  assert.equal(await verifyToken(user, ["access"]), null);
  assert.equal(await verifyToken("", ["access"]), null);
  assert.equal(await verifyToken(null), null);

  assert.ok(adminAuth.verifyAccessToken(access));
  assert.ok(adminAuth.verifyAdminToken(access));
  assert.ok(adminAuth.verifyRefreshToken(refresh));
  assert.ok(adminAuth.verifyUserToken(user));
  assert.equal(adminAuth.verifyUserToken(access), null, "progress route must not accept admin access tokens");
  assert.equal(adminAuth.verifyAdminToken(user), null, "admin routes must not accept user session tokens");
});

run("tokens: forged signature rejected (constant-time compare)", async () => {
  const token = await generateToken("a@b.c", "user", "user");
  const [payloadB64, sig] = token.split(".");

  // Valid length, wrong content.
  const flipped = (sig[0] === "A" ? "B" : "A") + sig.slice(1);
  assert.equal(await verifyToken(`${payloadB64}.${flipped}`), null);

  // Tampered payload + signature re-derived with the WRONG secret.
  const otherPayloadB64 = Buffer.from(
    JSON.stringify({ email: "attacker@biolearn.test", role: "admin", exp: Date.now() + 60_000, type: "user" })
  ).toString("base64url");
  const otherSig = crypto.createHmac("sha256", "wrong-secret").update(otherPayloadB64).digest("base64url");
  assert.equal(await verifyToken(`${otherPayloadB64}.${otherSig}`, ["user"]), null);
});

run("tokens: expired token rejected", async () => {
  const payloadB64 = Buffer.from(
    JSON.stringify({ email: "a@b.c", role: "user", exp: Date.now() - 60_000, type: "user" })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", process.env.ADMIN_TOKEN_SECRET as string)
    .update(payloadB64)
    .digest("base64url");
  assert.equal(await verifyToken(`${payloadB64}.${sig}`, ["user"]), null);
});

run("tokens: helpers behave", () => {
  assert.equal(isOwnerEmail("A@B.COM", "  a@b.com "), true, "ownership check must be case/whitespace-insensitive");
  assert.equal(isOwnerEmail("a@b.com", "attacker@evil.com"), false);
  assert.equal(isOwnerEmail("", "a@b.com"), false);
  assert.equal(isOwnerEmail("a@b.com", ""), false);

  const p = { email: "a@b.c", role: "user", exp: 5, type: "user" as const };
  const enc = encodePayload(p);
  assert.deepEqual(decodePayload(enc), p);

  const a = new Uint8Array([1, 2, 3]);
  const b = new Uint8Array([1, 2, 3]);
  const c = new Uint8Array([1, 2, 4]);
  assert.equal(timingSafeBytesEqual(a, b), true);
  assert.equal(timingSafeBytesEqual(a, c), false);
  assert.equal(timingSafeBytesEqual(a, new Uint8Array([1, 2])), false);
});

// ---------------------------------------------------------------- allowlist

run("media allowlist: dev-only hosts excluded in production", () => {
  assert.equal(isHostAllowed("raw.githubusercontent.com", "production"), true);
  assert.equal(isHostAllowed("cdn.jsdelivr.net", "production"), true);
  assert.equal(isHostAllowed("supabase.co", "production"), true);
  assert.equal(isHostAllowed("evil.example.com", "production"), false);
  assert.equal(isHostAllowed("169.254.169.254", "production"), false);
  assert.equal(isHostAllowed("localhost", "production"), false, "SSRF hardening: localhost must be rejected in prod");
  assert.equal(isHostAllowed("127.0.0.1", "production"), false, "SSRF hardening: loopback must be rejected in prod");
  assert.equal(isHostAllowed("localhost", "development"), true, "localhost allowed in dev");
  assert.equal(isHostAllowed("", "production"), false);
});

// ---------------------------------------------------------------- roles

run("user role whitelist", () => {
  assert.deepEqual([...VALID_USER_ROLES].sort(), ["admin", "user"]);
  assert.equal(isValidUserRole("user"), true);
  assert.equal(isValidUserRole("admin"), true);
  assert.equal(isValidUserRole("superadmin"), false);
  assert.equal(isValidUserRole(""), false);
  assert.equal(isValidUserRole("ADMIN"), false);
  assert.equal(isValidUserRole(null), false);
  assert.equal(isValidUserRole(undefined), false);
  assert.equal(isValidUserRole({}), false);
});

// ---------------------------------------------- static source regressions

run("static: fallback secret is gone from all source files", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) walk(full);
      else if (/\.(ts|tsx|mjs)$/.test(f.name)) files.push(full);
    }
  };
  walk(path.join(root, "src"));
  for (const f of files) {
    assert.doesNotMatch(
      readFileSync(f, "utf8"),
      /biolearn-fallback-secret-2024/,
      `hard-coded fallback secret found in ${path.relative(root, f)}`
    );
  }
  assert.match(src("src/lib/admin-auth.ts"), /timingSafeEqual/, "admin token compare must be constant-time");
});

run("static: proxy only accepts access tokens via shared verifier", () => {
  const proxy = src("src/proxy.ts");
  assert.match(proxy, /verifyToken\(token, \["access"\]\)/);
  assert.doesNotMatch(proxy, /signature !== expectedSig/, "proxy must not use plain string comparison");
});

run("static: admin-guard no longer trusts client-set headers", () => {
  const guard = src("src/lib/admin-guard.ts");
  assert.equal(/req\.headers\.get\("x-admin-email"\)/.test(guard), false, "requireAdmin must not read x-admin-email");
  assert.equal(/req\.headers\.get\("x-admin-role"\)/.test(guard), false, "requireAdmin must not read x-admin-role");
  assert.match(guard, /verifyAccessToken\(token\)/);
});

run("static: rate limiter fails closed", () => {
  const rl = src("src/lib/rate-limit.ts");
  assert.match(rl, /allowed: false/, "error paths must deny");
  assert.equal(/allowed: true/.test(rl), false, "fail-open branches are forbidden in rate-limit.ts");
});

run("static: progress route enforces ownership + session", () => {
  const p = src("src/app/api/progress/route.ts");
  assert.match(p, /verifyUserToken\(token\)/);
  assert.match(p, /isOwnerEmail\(session\.email, email\)/, "progress GET/POST must verify the token owner owns the requested email");
  assert.match(p, /403/, "ownership mismatch must 403");
});

run("static: register no longer auto-verifies email", () => {
  const reg = src("src/app/api/auth/register/route.ts");
  assert.equal(/email_verified: true/.test(reg), false, "register must not set email_verified directly");
  assert.match(reg, /createVerificationCode/, "register must go through the real verification flow");
  assert.match(reg, /needsVerification/);
});

run("static: login route hardening", () => {
  const login = src("src/app/api/auth/login/route.ts");
  assert.match(login, /x-real-ip/, "trusted IP header must be preferred");
  assert.match(login, /auth:login:email/, "per-email brute-force limiter must exist");
  assert.match(login, /biolearn_token/, "regular user session cookie must be issued at login");
});

run("static: anti-enumeration login gate", () => {
  const login = src("src/app/api/auth/login/route.ts");
  assert.match(login, /needsVerification/);
  assert.match(login, /email_verified === false/);
});

run("static: verification endpoints do not leak account existence", () => {
  const sendRoute = src("src/app/api/auth/verify/send/route.ts");
  assert.equal(/"Email belum terdaftar"/.test(sendRoute), false, "verify/send must not leak account existence");
  const forgot = src("src/app/api/auth/forgot-password/send/route.ts");
  assert.equal(/"Email belum terdaftar"/.test(forgot), false, "forgot/send must not leak account existence");
});

run("static: media-proxy re-validates redirect destination", () => {
  const proxy = src("src/app/api/media-proxy/route.ts");
  assert.match(proxy, /isHostAllowed\(finalUrl\.hostname\)/, "post-redirect final URL must be re-validated");
  assert.equal(proxy.includes('"localhost"'), false, "localhost must not be embedded in proxy code");
});
