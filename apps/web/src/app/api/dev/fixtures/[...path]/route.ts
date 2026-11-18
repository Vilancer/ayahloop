import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves the LOCAL, git-ignored fixtures written by scripts/dev-mushaf-fixture.sh
 * to the mobile dev Mushaf rendering test. Development only: every other
 * environment answers 404, and the files never sit in public/, so a production
 * build cannot serve them.
 */
const ROOT = path.join(process.cwd(), ".dev-fixtures");
const CONTENT_TYPES: Readonly<Record<string, string>> = { ".json": "application/json", ".ttf": "font/ttf" };
/** One plain path segment: no "..", no separators, no leading dot. */
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9_-]*(\.[A-Za-z0-9]+)?$/;

const notFound = () => new Response(null, { status: 404 });

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (process.env.NODE_ENV !== "development") return notFound();
  const { path: segments } = await params;
  const contentType = CONTENT_TYPES[path.extname(segments.at(-1) ?? "")];
  if (!contentType || !segments.every((segment) => SEGMENT.test(segment))) return notFound();
  try {
    const body = await readFile(path.join(ROOT, ...segments));
    return new Response(new Uint8Array(body), { headers: { "content-type": contentType, "cache-control": "no-store" } });
  } catch {
    return notFound();
  }
}
