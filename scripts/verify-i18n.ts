/**
 * pnpm verify:i18n (no server needed).
 * Verifies en.json and ar.json key parity, sorting, non-empty strings,
 * and that every spine enum value has its i18n label in both locales.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_ERROR_CODES,
  LEARNING_STEP_KINDS,
  LEARNING_STEP_STATUSES,
  LOOP_MODES,
  MASTERY_LEVELS,
  PART_KINDS,
} from "../packages/shared/src";
import { assert, done, test } from "./check";

const dir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../packages/i18n/messages",
);

function loadCatalog(locale: "en" | "ar"): Record<string, string> {
  return JSON.parse(fs.readFileSync(path.join(dir, `${locale}.json`), "utf8")) as Record<
    string,
    string
  >;
}

async function main() {
  const en = loadCatalog("en");
  const ar = loadCatalog("ar");
  const enKeys = Object.keys(en);
  const arKeys = Object.keys(ar);

  await test("en.json and ar.json have identical key sets", () => {
    const missingInAr = enKeys.filter((k) => !(k in ar));
    const missingInEn = arKeys.filter((k) => !(k in en));
    assert.deepEqual({ missingInAr, missingInEn }, { missingInAr: [], missingInEn: [] });
  });

  await test("keys are sorted and non-empty in both catalogs", () => {
    assert.deepEqual(enKeys, [...enKeys].sort(), "en.json keys must be sorted");
    assert.deepEqual(arKeys, [...arKeys].sort(), "ar.json keys must be sorted");
    for (const [k, v] of Object.entries(en)) {
      assert.ok(v.trim().length > 0, `en.json "${k}" is empty`);
    }
    for (const [k, v] of Object.entries(ar)) {
      assert.ok(v.trim().length > 0, `ar.json "${k}" is empty`);
    }
  });

  await test("every spine enum value has an i18n label in en and ar", () => {
    const requiredKeys = [
      ...PART_KINDS.map((v) => `part.kind.${v}`),
      ...LEARNING_STEP_KINDS.map((v) => `step.kind.${v}`),
      ...LEARNING_STEP_STATUSES.map((v) => `step.status.${v}`),
      ...LOOP_MODES.map((v) => `loop.mode.${v}`),
      ...MASTERY_LEVELS.map((v) => `mastery.${v}`),
      ...API_ERROR_CODES.map((v) => `errors.${v}`),
    ];
    for (const key of requiredKeys) {
      assert.ok(key in en, `en.json missing "${key}"`);
      assert.ok(key in ar, `ar.json missing "${key}"`);
    }
  });

  done("verify:i18n");
}

void main();
