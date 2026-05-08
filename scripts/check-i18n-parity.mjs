/**
 * Verifies that es.json has every key present in en.json.
 * Run via: node scripts/check-i18n-parity.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const en = JSON.parse(readFileSync(resolve(root, "src/locales/ui/en.json"), "utf8"));
const es = JSON.parse(readFileSync(resolve(root, "src/locales/ui/es.json"), "utf8"));

function getLeafKeys(obj, prefix = "") {
  return Object.keys(obj).flatMap((k) => {
    const path = prefix ? `${prefix}.${k}` : k;
    const value = obj[k];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return getLeafKeys(value, path);
    }
    return [path];
  });
}

const enKeys = new Set(getLeafKeys(en));
const esKeys = new Set(getLeafKeys(es));

const missing = [...enKeys].filter((k) => !esKeys.has(k));

if (missing.length > 0) {
  console.error("❌ es.json is missing these keys from en.json:");
  for (const k of missing) console.error(`  - ${k}`);
  process.exit(1);
}

console.log(`✓ es.json has all ${enKeys.size} keys from en.json`);
