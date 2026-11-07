/** WCAG 2.1 relative luminance and contrast ratio for #rrggbb strings. */

function srgbChannel(hex2: string): number {
  const c = Number.parseInt(hex2, 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const clean = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Expected #rrggbb colour, got "${hex}"`);
  }
  const r = srgbChannel(clean.slice(0, 2));
  const g = srgbChannel(clean.slice(2, 4));
  const b = srgbChannel(clean.slice(4, 6));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
