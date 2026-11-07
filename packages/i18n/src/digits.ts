const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";

export function hasArabicDigits(input: string): boolean {
  return /[٠-٩۰-۹]/.test(input);
}

/**
 * Convert Arabic-Indic (U+0660–0669) and Persian (U+06F0–06F9) digits to Latin (0–9).
 * Hermes ignores `-u-nu-latn`, so every number/counter passes through here (AGENTS rule 17).
 */
export function latinDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const a = ARABIC_INDIC.indexOf(ch);
    const p = a >= 0 ? a : PERSIAN.indexOf(ch);
    out += p >= 0 ? String(p) : ch;
  }
  return out;
}
