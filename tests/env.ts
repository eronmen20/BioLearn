// Test bootstrap. MUST stay the first import of every test entry file:
// 1. Sets the test secret FIRST in the ESM evaluation order so that modules
//    captured at import time (e.g. admin-auth.ts SECRET) see it.
// 2. Registers the "@/..." path-alias resolver for dynamic imports below.
process.env.ADMIN_TOKEN_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
await import("node:module").then((m) =>
  m.register(new URL("./register-alias.mjs", import.meta.url))
);
