// ESM resolve hook so plain `node` can load the app's "@/..." TS modules
// during the security regression suite. No runtime dependency added — this
// runs only in tests.
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

function resolveWithExtensions(base) {
  for (const candidate of [base, `${base}.ts`, path.join(base, "index.ts")]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "src",
      specifier.slice(2)
    );
    const resolved = resolveWithExtensions(base);
    if (resolved) {
      return {
        // No `format` override — let Node's default load step (incl. TS
        // type-stripping) handle .ts files.
        url: new URL(`file:///${resolved.replace(/\\/g, "/")}`).href,
        shortCircuit: true,
      };
    }
  }
  return nextResolve(specifier, context);
}
