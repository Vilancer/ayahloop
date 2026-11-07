/**
 * pnpm verify:tokens (no server needed).
 * 1. Committed adapters in packages/design-tokens/generated/ equal a fresh render.
 * 2. Every semantic text/surface pair meets its WCAG AA contrast threshold in both light and dark schemes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COLORS,
  CONTRAST_PAIRS,
  GENERATED_FILES,
  contrastRatio,
} from "../packages/design-tokens/src";
import { assert, done, test } from "./check";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../packages/design-tokens",
);

async function main() {
  for (const file of GENERATED_FILES) {
    await test(`${file.path} matches tokens.ts`, () => {
      const target = path.join(root, file.path);
      assert.ok(fs.existsSync(target), `${file.path} missing: run pnpm tokens:generate`);
      const onDisk = fs.readFileSync(target, "utf8");
      assert.equal(onDisk, file.render(), `${file.path} drifted: run pnpm tokens:generate`);
    });
  }

  for (const scheme of ["light", "dark"] as const) {
    for (const pair of CONTRAST_PAIRS) {
      await test(`${scheme}: ${pair.fg} on ${pair.bg} ≥ ${pair.min}`, () => {
        const ratio = contrastRatio(COLORS[scheme][pair.fg], COLORS[scheme][pair.bg]);
        assert.ok(ratio >= pair.min, `${ratio.toFixed(2)} < ${pair.min}`);
      });
    }
  }

  done("verify:tokens");
}

void main();
