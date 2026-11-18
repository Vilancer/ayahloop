/** A base Arabic letter (hamza to ya, plus alef wasla). */
const isLetter = (cp: number) => (cp >= 0x0621 && cp <= 0x064a) || cp === 0x0671;
/** Combining marks that belong to the letter before them. */
const isMark = (cp: number) =>
  (cp >= 0x064b && cp <= 0x065f) || cp === 0x0670 || (cp >= 0x06d6 && cp <= 0x06ed) || (cp >= 0x08d3 && cp <= 0x08ff);

export type LetterSpan = { before: string; letter: string; after: string };

/**
 * Splits a word around one letter in the middle of it (with the marks on that
 * letter), so the letter can be styled on its own. The three parts joined are
 * always the original text, unchanged. Returns null when the word has no letter
 * with a letter on both sides.
 */
export function splitMiddleLetter(text: string): LetterSpan | null {
  const chars = Array.from(text);
  const cps = chars.map((c) => c.codePointAt(0) ?? 0);
  const letters = cps.flatMap((cp, i) => (isLetter(cp) ? [i] : []));
  if (letters.length < 3) return null;
  const start = letters[Math.floor(letters.length / 2)];
  if (start === undefined) return null;
  let end = start + 1;
  while (end < cps.length && isMark(cps[end] ?? 0)) end += 1;
  return { before: chars.slice(0, start).join(""), letter: chars.slice(start, end).join(""), after: chars.slice(end).join("") };
}
