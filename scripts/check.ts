/** Tiny test harness shared by every scripts/verify-*.ts. */
import assert from "node:assert/strict";

let failures = 0;
let passes = 0;

export async function test(
  name: string,
  fn: () => void | Promise<void>,
): Promise<void> {
  try {
    await fn();
    passes += 1;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures += 1;
    console.error(
      `  ✗ ${name}\n    ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

export function done(label: string): void {
  console.log(`\n${label}: ${passes} passed, ${failures} failed`);
  if (failures > 0) process.exit(1);
}

export { assert };
