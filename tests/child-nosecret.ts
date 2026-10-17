// Regressions for the "no fallback secret" fix (audit finding H1/C-A).
// Runs in a child process WITHOUT ADMIN_TOKEN_SECRET so that the fallback
// secret cannot be introduced again without this suite failing.
delete process.env.ADMIN_TOKEN_SECRET;
await import("node:module").then((m) => m.register(new URL("./register-alias.mjs", import.meta.url)));

const { verifyAdminToken, verifyUserToken, generateAccessToken } = await import("@/lib/admin-auth");
const { verifyToken, generateToken } = await import("@/lib/tokens");

const crypto = await import("node:crypto");
import assert from "node:assert/strict";

// Forge the exact token an attacker would mint with the OLD hard-coded
// fallback secret "biolearn-fallback-secret-2024".
const payloadB64 = Buffer.from(
  JSON.stringify({
    email: "attacker@biolearn.test",
    role: "admin",
    exp: Date.now() + 60_000,
    type: "access",
  })
).toString("base64url");
const fallbackSig = crypto
  .createHmac("sha256", "biolearn-fallback-secret-2024")
  .update(payloadB64)
  .digest("base64url");
const forgedToken = `${payloadB64}.${fallbackSig}`;

assert.equal(verifyAdminToken(forgedToken), null, "forged token with fallback secret must be rejected (admin-auth)");
assert.equal(verifyUserToken(forgedToken), null, "forged token with fallback secret must be rejected (user path)");
assert.equal(await verifyToken(forgedToken, ["access"]), null, "forged token with fallback secret must be rejected (proxy/tokens)");

// Generation must fail closed rather than sign with a default secret.
assert.throws(() => generateAccessToken("a@b.c", "admin"), /ADMIN_TOKEN_SECRET/, "generateAccessToken must throw without secret");
await assert.rejects(() => generateToken("a@b.c", "admin", "access"), /ADMIN_TOKEN_SECRET/, "generateToken must throw without secret");

console.log("fallback-secret regressions: all assertions passed");
